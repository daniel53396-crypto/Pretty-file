import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const $ = (id) => document.getElementById(id);
const CONFIG_URL = 'fixa_supabase_url';
const CONFIG_KEY = 'fixa_supabase_public_key';
let supabase = null;
let currentUser = null;
let files = [];
const BUCKET = 'fixa-files';
const MAX_FILE_SIZE = 100 * 1024 * 1024;
const ALLOWED_EXTENSIONS = new Set(['zip','apk','pdf','png','jpg','jpeg','gif','webp','txt','doc','docx','xls','xlsx','ppt','pptx','mp4','mp3','json','csv','7z','rar']);

setTimeout(() => {
  $('splash').classList.add('fade');
  setTimeout(() => {
    $('splash').classList.add('hidden');
    $('app').classList.remove('hidden');
    initialize();
  }, 420);
}, 1400);

function message(id, text, error=false) {
  const el=$(id); el.textContent=text||''; el.classList.toggle('error',!!error);
}
function clientFromSavedConfig() {
  const url=localStorage.getItem(CONFIG_URL);
  const key=localStorage.getItem(CONFIG_KEY);
  if (!url || !key) return null;
  try { return createClient(url,key); } catch { return null; }
}
function initialize() {
  supabase=clientFromSavedConfig();
  if (!supabase) { $('config-view').classList.remove('hidden'); return; }
  $('config-view').classList.add('hidden');
  $('auth-view').classList.remove('hidden');
  supabase.auth.onAuthStateChange((event, session) => {
    if (session?.user) {
      currentUser=session.user;
      // Avoid doing complex Supabase work inside the auth callback.
      setTimeout(() => enterDashboard(session.user),0);
    } else if (event === 'SIGNED_OUT') {
      currentUser=null; leaveDashboard();
    }
  });
  supabase.auth.getSession().then(({data,error})=>{
    if(error) return message('auth-message',error.message,true);
    if(data.session) enterDashboard(data.session.user);
  });
}
$('config-form').addEventListener('submit', e=>{
  e.preventDefault();
  const url=$('project-url').value.trim().replace(/\/+$/,'');
  const key=$('anon-key').value.trim();
  if(!/^https:\/\/[a-zA-Z0-9-]+\.supabase\.co$/.test(url)) return alert('சரியான Supabase Project URL-ஐ உள்ளிடவும்.');
  if(!key || key.toLowerCase().includes('service_role')) return alert('Publishable / anon public key மட்டும் பயன்படுத்தவும். Secret key பயன்படுத்த வேண்டாம்.');
  localStorage.setItem(CONFIG_URL,url); localStorage.setItem(CONFIG_KEY,key);
  supabase=createClient(url,key);
  $('config-view').classList.add('hidden'); $('auth-view').classList.remove('hidden');
  supabase.auth.onAuthStateChange((event, session)=>{
    if(session?.user){currentUser=session.user;setTimeout(()=>enterDashboard(session.user),0)}
    else if(event==='SIGNED_OUT'){currentUser=null;leaveDashboard()}
  });
});
$('google-login').addEventListener('click', async () => {
  if (!supabase) return message('auth-message','முதலில் Supabase அமைக்கவும்.',true);
  const button=$('google-login'); button.disabled=true;
  message('auth-message','Google Login திறக்கப்படுகிறது…');
  try {
    const {error}=await supabase.auth.signInWithOAuth({
      provider:'google',
      options:{redirectTo:window.location.origin}
    });
    if(error) throw error;
  } catch(err) {
    message('auth-message',friendlyError(err),true);
    button.disabled=false;
  }
});
function friendlyError(err) {
  const m=String(err?.message||err);
  if(m.toLowerCase().includes('provider is not enabled')) return 'Supabase-ல் Google Provider இன்னும் Enable செய்யப்படவில்லை.';
  return m;
}
function enterDashboard(user) {
  if(!user) return;
  currentUser=user;
  $('config-view').classList.add('hidden'); $('auth-view').classList.add('hidden'); $('dashboard').classList.remove('hidden');
  $('user-pill').textContent=user.email||'Signed in'; $('user-pill').classList.remove('hidden'); $('logout-btn').classList.remove('hidden');
  loadFiles();
}
function leaveDashboard() {
  $('dashboard').classList.add('hidden'); $('user-pill').classList.add('hidden'); $('logout-btn').classList.add('hidden');
  $('auth-view').classList.remove('hidden'); files=[]; renderFiles();
}
$('logout-btn').addEventListener('click',async()=>{
  if(!supabase)return;
  const {error}=await supabase.auth.signOut();
  if(error) message('dashboard-message',error.message,true);
});
function safeSegment(name){return name.replace(/[^\w.\- ()\[\]]/g,'_').slice(0,150)||'file'}
function formatSize(bytes){
  if(bytes<1024)return bytes+' B';
  const u=['KB','MB','GB'];let n=bytes/1024,i=0;
  while(n>=1024&&i<u.length-1){n/=1024;i++}
  return n.toFixed(n>=10?1:2)+' '+u[i]
}
function fileType(name){
  const ext=(name.split('.').pop()||'FILE').toUpperCase();
  return ext.length<=5?ext:'FILE';
}
async function loadFiles(){
  if(!supabase||!currentUser)return;
  message('dashboard-message','கோப்புகளை ஏற்றுகிறது…');
  const {data,error}=await supabase.from('user_files')
    .select('id, owner_id, object_path, original_name, size_bytes, mime_type, created_at')
    .order('created_at',{ascending:false});
  if(error){message('dashboard-message','கோப்புகளை ஏற்ற முடியவில்லை: '+error.message,true);return}
  files=data||[];message('dashboard-message','');renderFiles();
}
function renderFiles(){
  const query=$('search').value.toLowerCase();
  const shown=files.filter(f=>f.original_name.toLowerCase().includes(query));
  $('file-count').textContent=`${files.length} கோப்பு${files.length===1?'':'கள்'}`;
  $('file-list').innerHTML='';
  $('empty-state').classList.toggle('hidden',shown.length>0);
  if(files.length&&!shown.length){$('empty-state').querySelector('strong').textContent='கோப்பு கிடைக்கவில்லை';$('empty-state').querySelector('p').textContent='வேறு வார்த்தையைத் தேடவும்'}
  else if(!files.length){$('empty-state').querySelector('strong').textContent='இன்னும் கோப்புகள் இல்லை';$('empty-state').querySelector('p').textContent='முதல் கோப்பை Upload செய்து தொடங்குங்கள்'}
  for(const f of shown){
    const card=document.createElement('article');card.className='file-card';
    const icon=document.createElement('div');icon.className='file-icon';icon.textContent=fileType(f.original_name);
    const info=document.createElement('div');info.className='file-info';
    const name=document.createElement('div');name.className='file-name';name.title=f.original_name;name.textContent=f.original_name;
    const meta=document.createElement('div');meta.className='file-meta';meta.textContent=formatSize(f.size_bytes)+' · '+new Date(f.created_at).toLocaleDateString();
    info.append(name,meta);
    const actions=document.createElement('div');actions.className='file-actions';
    const dl=document.createElement('button');dl.className='icon-btn';dl.title='Download';dl.setAttribute('aria-label','Download '+f.original_name);dl.textContent='↓';dl.addEventListener('click',()=>downloadFile(f));
    const del=document.createElement('button');del.className='icon-btn';del.title='Delete';del.setAttribute('aria-label','Delete '+f.original_name);del.textContent='×';del.addEventListener('click',()=>deleteFile(f));
    actions.append(dl,del);card.append(icon,info,actions);$('file-list').append(card);
  }
}
function validFile(file){
  if(file.size>MAX_FILE_SIZE)throw new Error(file.name+': 100 MB-ஐ விட பெரிய கோப்பு அனுமதிக்கப்படாது.');
  const ext=(file.name.split('.').pop()||'').toLowerCase();
  if(!ALLOWED_EXTENSIONS.has(ext))throw new Error(file.name+': இந்த File Type அனுமதிக்கப்படவில்லை.');
}
async function uploadFiles(fileList){
  if(!supabase||!currentUser||!fileList?.length)return;
  const selected=Array.from(fileList);
  try{selected.forEach(validFile)}catch(e){message('dashboard-message',e.message,true);return}
  const choose=$('choose-files');choose.disabled=true;
  let uploaded=0;
  try{
    for(const file of selected){
      message('dashboard-message',`Upload செய்கிறது: ${file.name} (${uploaded+1}/${selected.length})`);
      const id=crypto.randomUUID();
      const objectPath=`${currentUser.id}/${id}-${safeSegment(file.name)}`;
      const {error:upErr}=await supabase.storage.from(BUCKET).upload(objectPath,file,{cacheControl:'3600',upsert:false,contentType:file.type||'application/octet-stream'});
      if(upErr)throw upErr;
      const {error:dbErr}=await supabase.from('user_files').insert({
        owner_id:currentUser.id, object_path:objectPath, original_name:file.name,
        size_bytes:file.size, mime_type:file.type||'application/octet-stream'
      });
      if(dbErr){
        // Best-effort cleanup if metadata insert fails.
        await supabase.storage.from(BUCKET).remove([objectPath]);
        throw dbErr;
      }
      uploaded++;
    }
    message('dashboard-message',`${uploaded} கோப்பு(கள்) வெற்றிகரமாக Upload ஆனது.`);
    $('file-input').value='';await loadFiles();
  }catch(e){message('dashboard-message','Upload தோல்வி: '+e.message,true)}
  finally{choose.disabled=false}
}
async function downloadFile(file){
  message('dashboard-message','Download link உருவாக்குகிறது…');
  const {data,error}=await supabase.storage.from(BUCKET).createSignedUrl(file.object_path,60);
  if(error){message('dashboard-message','Download தோல்வி: '+error.message,true);return}
  const a=document.createElement('a');a.href=data.signedUrl;a.download=file.original_name;a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove();
  message('dashboard-message','Download தொடங்கப்பட்டது. Browser கேட்கும் அனுமதியை ஏற்கவும்.');
}
async function deleteFile(file){
  if(!confirm(`"${file.original_name}" கோப்பை நிரந்தரமாக நீக்கவா?`))return;
  message('dashboard-message','கோப்பை நீக்குகிறது…');
  const {error:storageError}=await supabase.storage.from(BUCKET).remove([file.object_path]);
  if(storageError){message('dashboard-message','Storage-லிருந்து நீக்க முடியவில்லை: '+storageError.message,true);return}
  const {error:dbError}=await supabase.from('user_files').delete().eq('id',file.id);
  if(dbError){message('dashboard-message','கோப்பு நீக்கப்பட்டது; பட்டியல் புதுப்பிப்பதில் பிழை: '+dbError.message,true);return}
  files=files.filter(x=>x.id!==file.id);renderFiles();message('dashboard-message','கோப்பு நீக்கப்பட்டது.');
}
$('search').addEventListener('input',renderFiles);
$('choose-files').addEventListener('click',()=>$('file-input').click());
$('file-input').addEventListener('change',e=>uploadFiles(e.target.files));
const zone=$('drop-zone');
zone.addEventListener('dragover',e=>{e.preventDefault();zone.classList.add('dragging')});
zone.addEventListener('dragleave',()=>zone.classList.remove('dragging'));
zone.addEventListener('drop',e=>{e.preventDefault();zone.classList.remove('dragging');uploadFiles(e.dataTransfer.files)});
