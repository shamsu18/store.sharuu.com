import {
  ImagePlus,
  Palette,
  Plus,
  RotateCcw,
  Save,
  Trash2
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { useStore } from '../../contexts/StoreContext';
import { DEFAULT_ADMIN_LOGIN_SLUG, getAdminLoginPath, isReservedAdminLoginSlug, makeId } from '../../lib/utils';
import { api } from '../../services/api';

const DEFAULT_PRIMARY_COLOR = '#0f172a';
const DEFAULT_SECONDARY_COLOR = '#d97706';

function normalizeSocialLinks(value) {
  if (Array.isArray(value)) {
    return value.map((item, index) => ({
      id: item?.id || `social-${index + 1}`,
      platform: String(item?.platform || '').trim(),
      url: String(item?.url || '').trim(),
      active: item?.active !== false
    }));
  }

  if (value && typeof value === 'object') {
    return Object.entries(value).map(([platform, url], index) => ({
      id: `social-${platform || index + 1}`,
      platform,
      url: String(url || '').trim(),
      active: true
    }));
  }

  return [];
}

function isValidHexColor(value) {
  return /^#[0-9a-fA-F]{6}$/.test(String(value || '').trim());
}

function getSafeColor(value, fallback) {
  return isValidHexColor(value) ? value : fallback;
}

function prepareHexInput(value) {
  const cleaned = String(value || '')
    .trim()
    .replace(/[^0-9a-fA-F#]/g, '')
    .replace(/#/g, '');

  return `#${cleaned.slice(0, 6)}`;
}

function hexToRgba(hex, alpha = 1) {
  const safeHex = isValidHexColor(hex) ? hex.slice(1) : '0f172a';
  const number = Number.parseInt(safeHex, 16);
  const red = (number >> 16) & 255;
  const green = (number >> 8) & 255;
  const blue = number & 255;

  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function ThemeColorField({
  title,
  description,
  usage,
  value,
  fallback,
  onChange
}) {
  const safeColor = getSafeColor(value, fallback);

  return (
    <article
      style={{
        minWidth: 0,
        border: '1px solid #e2e8f0',
        borderRadius: 22,
        background: '#ffffff',
        padding: 18,
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 14
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 64,
            height: 64,
            flexShrink: 0,
            overflow: 'hidden',
            borderRadius: 18,
            border: '4px solid #ffffff',
            background: safeColor,
            boxShadow: `0 0 0 1px #cbd5e1, 0 10px 24px ${hexToRgba(
              safeColor,
              0.24
            )}`
          }}
          title={`Current color: ${safeColor}`}
        >
          <input
            type="color"
            value={safeColor}
            onChange={event => onChange(event.target.value)}
            aria-label={`Choose ${title}`}
            style={{
              position: 'absolute',
              inset: -10,
              width: 90,
              height: 90,
              cursor: 'pointer',
              opacity: 0
            }}
          />
        </div>

        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 10
            }}
          >
            <h4
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 16,
                lineHeight: 1.3
              }}
            >
              {title}
            </h4>

            <span
              style={{
                width: 10,
                height: 10,
                flexShrink: 0,
                borderRadius: 999,
                background: safeColor,
                boxShadow: `0 0 0 4px ${hexToRgba(safeColor, 0.12)}`
              }}
            />
          </div>

          <p
            style={{
              margin: '5px 0 0',
              color: '#64748b',
              fontSize: 12,
              lineHeight: 1.55
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <label
        style={{
          display: 'block',
          marginTop: 16,
          color: '#475569',
          fontSize: 12,
          fontWeight: 800
        }}
      >
        HEX color code
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 8
          }}
        >
          <span
            style={{
              width: 38,
              height: 38,
              flexShrink: 0,
              borderRadius: 12,
              border: '1px solid #cbd5e1',
              background: safeColor
            }}
          />

          <input
            value={value || fallback}
            maxLength={7}
            spellCheck={false}
            placeholder={fallback}
            onChange={event => onChange(prepareHexInput(event.target.value))}
            onBlur={() => {
              if (!isValidHexColor(value)) {
                onChange(safeColor);
              }
            }}
            style={{
              width: '100%',
              minWidth: 0,
              border: `1px solid ${
                isValidHexColor(value) ? '#cbd5e1' : '#ef4444'
              }`,
              borderRadius: 12,
              background: '#f8fafc',
              padding: '11px 12px',
              color: '#0f172a',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontSize: 13,
              fontWeight: 800,
              textTransform: 'uppercase',
              outline: 'none'
            }}
          />
        </div>
      </label>

      <div
        style={{
          marginTop: 14,
          borderRadius: 14,
          background: '#f8fafc',
          padding: '11px 12px',
          color: '#64748b',
          fontSize: 11,
          lineHeight: 1.55
        }}
      >
        <strong style={{ color: '#334155' }}>Used for:</strong> {usage}
      </div>
    </article>
  );
}

function ThemePreview({ primaryColor, secondaryColor }) {
  const primary = getSafeColor(primaryColor, DEFAULT_PRIMARY_COLOR);
  const secondary = getSafeColor(secondaryColor, DEFAULT_SECONDARY_COLOR);

  return (
    <aside
      style={{
        minWidth: 0,
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        borderRadius: 22,
        background: '#ffffff',
        boxShadow: '0 12px 35px rgba(15, 23, 42, 0.05)'
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          borderBottom: '1px solid #e2e8f0',
          padding: '15px 18px'
        }}
      >
        <div>
          <h4
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 15
            }}
          >
            Live theme preview
          </h4>
          <p
            style={{
              margin: '4px 0 0',
              color: '#64748b',
              fontSize: 11
            }}
          >
            This preview updates instantly.
          </p>
        </div>

        <Palette size={20} color={secondary} />
      </div>

      <div
        style={{
          padding: 18,
          background: `linear-gradient(145deg, ${hexToRgba(
            secondary,
            0.1
          )}, #ffffff 55%)`
        }}
      >
        <div
          style={{
            border: '1px solid #e2e8f0',
            borderRadius: 18,
            background: '#ffffff',
            padding: 18,
            boxShadow: '0 16px 35px rgba(15, 23, 42, 0.08)'
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              borderRadius: 999,
              background: hexToRgba(secondary, 0.12),
              padding: '6px 10px',
              color: secondary,
              fontSize: 10,
              fontWeight: 900,
              letterSpacing: '.08em',
              textTransform: 'uppercase'
            }}
          >
            New collection
          </span>

          <h3
            style={{
              margin: '14px 0 0',
              color: primary,
              fontSize: 24,
              lineHeight: 1.15
            }}
          >
            Your store theme
          </h3>

          <p
            style={{
              margin: '9px 0 0',
              color: '#64748b',
              fontSize: 12,
              lineHeight: 1.6
            }}
          >
            Primary controls the main brand tone. Secondary highlights actions
            and selected items.
          </p>

          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 10,
              marginTop: 16
            }}
          >
            <button
              type="button"
              style={{
                border: 0,
                borderRadius: 999,
                background: secondary,
                padding: '10px 16px',
                color: '#ffffff',
                fontSize: 11,
                fontWeight: 900,
                boxShadow: `0 10px 22px ${hexToRgba(secondary, 0.25)}`
              }}
            >
              Primary action
            </button>

            <button
              type="button"
              style={{
                border: `1px solid ${hexToRgba(primary, 0.22)}`,
                borderRadius: 999,
                background: '#ffffff',
                padding: '10px 16px',
                color: primary,
                fontSize: 11,
                fontWeight: 900
              }}
            >
              Secondary action
            </button>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
              gap: 10,
              marginTop: 16
            }}
          >
            <div
              style={{
                minWidth: 0,
                borderRadius: 14,
                background: primary,
                padding: 13,
                color: '#ffffff'
              }}
            >
              <small style={{ opacity: 0.72 }}>Primary</small>
              <strong
                style={{
                  display: 'block',
                  marginTop: 3,
                  fontSize: 11,
                  textTransform: 'uppercase'
                }}
              >
                {primary}
              </strong>
            </div>

            <div
              style={{
                minWidth: 0,
                borderRadius: 14,
                background: secondary,
                padding: 13,
                color: '#ffffff'
              }}
            >
              <small style={{ opacity: 0.8 }}>Secondary</small>
              <strong
                style={{
                  display: 'block',
                  marginTop: 3,
                  fontSize: 11,
                  textTransform: 'uppercase'
                }}
              >
                {secondary}
              </strong>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function HeroImageField({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [previewError, setPreviewError] = useState(false);
  const imageSource = String(value || '').trim();

  useEffect(() => {
    setPreviewError(false);
  }, [imageSource]);

  const uploadImage = async file => {
    if (!file) return;
    setUploading(true);
    setUploadError('');

    try {
      const uploaded = await api.uploadImages([file]);
      if (!uploaded?.[0]?.url) throw new Error('The hero image could not be uploaded.');
      onChange(uploaded[0].url);
    } catch (error) {
      setUploadError(error.message || 'The hero image could not be uploaded.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="hero-image-settings full-field">
      <div className="subsection-heading">
        <div>
          <h3>Hero Image</h3>
          <p>Upload an image or paste its direct URL. The selected image is previewed here before saving.</p>
        </div>
        {imageSource && (
          <button
            type="button"
            className="btn btn-light btn-small hero-image-remove"
            onClick={() => onChange('')}
          >
            <Trash2 size={14} />
            Remove
          </button>
        )}
      </div>

      <div className="hero-image-preview">
        {imageSource && !previewError ? (
          <img
            src={imageSource}
            alt="Current homepage hero preview"
            onError={() => setPreviewError(true)}
          />
        ) : (
          <div className="hero-image-placeholder">
            <ImagePlus size={30} />
            <strong>{previewError ? 'Image preview unavailable' : 'No hero image selected'}</strong>
            <span>{previewError ? 'Check the image URL or upload another file.' : 'Your current hero image will appear here.'}</span>
          </div>
        )}
        {imageSource && !previewError && <span className="hero-image-preview-label">Current preview</span>}
      </div>

      <div className="hero-image-controls">
        <label>
          Hero Image URL
          <input
            value={value || ''}
            inputMode="url"
            spellCheck={false}
            placeholder="https://example.com/hero-image.jpg"
            onChange={event => {
              setUploadError('');
              onChange(event.target.value);
            }}
          />
        </label>

        <label className={`btn btn-light hero-image-upload${uploading ? ' disabled' : ''}`}>
          <ImagePlus size={16} />
          {uploading ? 'Uploading...' : 'Upload Image'}
          <input
            hidden
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={uploading}
            onChange={async event => {
              const input = event.currentTarget;
              await uploadImage(input.files?.[0]);
              input.value = '';
            }}
          />
        </label>
      </div>

      {uploadError && <div className="error-box hero-image-error">{uploadError}</div>}
      <small className="hero-image-help">After choosing the image, click “Save Settings” to publish it on the homepage.</small>
    </section>
  );
}


export default function Settings() {
  const { settings,loadAdmin,adminLoaded,saveSettings }=useStore();
  const[form,setForm]=useState(null); const[tab,setTab]=useState('general'); const[saving,setSaving]=useState(false); const[message,setMessage]=useState('');
  useEffect(()=>{if(!adminLoaded)loadAdmin().catch(()=>{});},[adminLoaded,loadAdmin]);
  useEffect(()=>{if(settings){const cloned=JSON.parse(JSON.stringify(settings));setForm({...cloned,socialLinks:normalizeSocialLinks(cloned.socialLinks)});}},[settings]);
  if(!form)return <div className="screen-loader">Loading settings...</div>;
  const set=(key,value)=>setForm(previous=>({...previous,[key]:value}));
  const uploadOne=async(file,key)=>{if(!file)return;const uploaded=await api.uploadImages([file]);if(uploaded?.[0])set(key,uploaded[0].url);};
  const uploadArrayImage=async(file,key,id)=>{if(!file)return;const uploaded=await api.uploadImages([file]);if(uploaded?.[0])set(key,(form[key]||[]).map(item=>item.id===id?{...item,image:uploaded[0].url}:item));};
  const updateSocial=(id,patch)=>setForm(previous=>({...previous,socialLinks:normalizeSocialLinks(previous.socialLinks).map(item=>item.id===id?{...item,...patch}:item)}));
  const addSocial=()=>setForm(previous=>({...previous,socialLinks:[...normalizeSocialLinks(previous.socialLinks),{id:makeId('social'),platform:'',url:'',active:true}]}));
  const removeSocial=id=>setForm(previous=>({...previous,socialLinks:normalizeSocialLinks(previous.socialLinks).filter(item=>item.id!==id)}));
  const resetThemeColors=()=>setForm(previous=>({...previous,primaryColor:DEFAULT_PRIMARY_COLOR,secondaryColor:DEFAULT_SECONDARY_COLOR}));
  const submit=async event=>{event.preventDefault();setSaving(true);setMessage('');try{const loginSlug=String(form.adminLoginSlug||DEFAULT_ADMIN_LOGIN_SLUG).trim()||DEFAULT_ADMIN_LOGIN_SLUG;if(isReservedAdminLoginSlug(loginSlug)){setMessage('That login URL slug is reserved. Choose a different value.');return;}const socialLinks=normalizeSocialLinks(form.socialLinks).map(item=>({...item,platform:item.platform.trim(),url:item.url.trim()})).filter(item=>item.platform&&item.url);const payload={...form,heroImage:String(form.heroImage||'').trim(),socialLinks,adminLoginSlug:loginSlug,primaryColor:getSafeColor(form.primaryColor,DEFAULT_PRIMARY_COLOR),secondaryColor:getSafeColor(form.secondaryColor,DEFAULT_SECONDARY_COLOR)};await saveSettings(payload);setForm(payload);setMessage('Settings saved successfully.');}catch(error){setMessage(error.message);}finally{setSaving(false);}};
  const tabs=['general','homepage','footer','social','shipping','payment','admin'];
  return <form onSubmit={submit}><div className="admin-page-heading sticky-editor-heading"><div><span className="eyebrow">Store configuration</span><h1>Settings</h1><p>Control homepage, footer, social media and checkout.</p></div><button className="btn btn-primary" disabled={saving}><Save size={16}/>{saving?'Saving...':'Save Settings'}</button></div><div className="editor-tabs">{tabs.map(item=><button type="button" key={item} className={tab===item?'active':''} onClick={()=>setTab(item)}>{item}</button>)}</div>{message&&<div className="notice">{message}</div>}<section className="admin-panel editor-panel">
  {tab==='general'&&<div>
    <div className="form-grid">
      <label>Store Name<input value={form.storeName||''} onChange={event=>set('storeName',event.target.value)}/></label>
      <label>Slogan<input value={form.slogan||''} onChange={event=>set('slogan',event.target.value)}/></label>
      <label>Support Phone<input value={form.supportPhone||''} onChange={event=>set('supportPhone',event.target.value)}/></label>
      <label>Support Email<input type="email" value={form.supportEmail||''} onChange={event=>set('supportEmail',event.target.value)}/></label>
      <label>Address<input value={form.address||''} onChange={event=>set('address',event.target.value)}/></label>
      <label>Currency Symbol<input value={form.currencySymbol||'৳'} onChange={event=>set('currencySymbol',event.target.value)}/></label>
    </div>

    <section className="settings-subsection" style={{marginTop:24,border:'1px solid #e2e8f0',borderRadius:26,background:'#f8fafc',padding:18}}>
      <div className="subsection-heading" style={{alignItems:'flex-start',marginBottom:18}}>
        <div>
          <div style={{display:'flex',alignItems:'center',gap:9}}><Palette size={19}/><h3 style={{margin:0}}>Store Theme Colors</h3></div>
          <p style={{margin:'7px 0 0',maxWidth:680,color:'#64748b',fontSize:13,lineHeight:1.6}}>Choose the two main colors used across your storefront. Click a color box or enter an exact HEX code.</p>
        </div>
        <button type="button" className="btn btn-light btn-small" onClick={resetThemeColors}><RotateCcw size={14}/>Reset colors</button>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit, minmax(250px, 1fr))',gap:16,alignItems:'stretch'}}>
        <ThemeColorField
          title="Primary Color"
          description="Your main brand color and strongest visual tone."
          usage="Main headings, dark brand sections, total boxes and primary text accents."
          value={form.primaryColor||DEFAULT_PRIMARY_COLOR}
          fallback={DEFAULT_PRIMARY_COLOR}
          onChange={value=>set('primaryColor',value)}
        />
        <ThemeColorField
          title="Secondary Color"
          description="Your action and highlight color for interactive elements."
          usage="Buttons, selected cards, radio controls, focus rings, badges and links."
          value={form.secondaryColor||DEFAULT_SECONDARY_COLOR}
          fallback={DEFAULT_SECONDARY_COLOR}
          onChange={value=>set('secondaryColor',value)}
        />
        <ThemePreview primaryColor={form.primaryColor} secondaryColor={form.secondaryColor}/>

      </div>
    </section>

    <div className="form-grid" style={{marginTop:24}}>
      <label className="full-field">Store Description<textarea rows="3" value={form.description||''} onChange={event=>set('description',event.target.value)}/></label>
      <label>Logo URL<input value={form.logo||''} onChange={event=>set('logo',event.target.value)}/></label>
      <label className="btn btn-light align-end"><ImagePlus size={16}/>Upload Logo<input hidden type="file" accept="image/*" onChange={event=>uploadOne(event.target.files?.[0],'logo')}/></label>
    </div>
  </div>}
  {tab==='homepage'&&<div>
    <div className="form-grid">
      <label>Announcement<input value={form.announcement||''} onChange={event=>set('announcement',event.target.value)}/></label>
      <label>Hero Title<input value={form.heroTitle||''} onChange={event=>set('heroTitle',event.target.value)}/></label>
      <label className="full-field">Hero Subtitle<textarea rows="2" value={form.heroSubtitle||''} onChange={event=>set('heroSubtitle',event.target.value)}/></label>
      <label>Hero Button Text<input value={form.heroButtonText||''} onChange={event=>set('heroButtonText',event.target.value)}/></label>
      <HeroImageField value={form.heroImage||''} onChange={value=>set('heroImage',value)}/>
    </div>

    <div className="settings-subsection">
      <div className="subsection-heading">
        <div><h3>New Arrivals Model Gallery</h3><p>Only model/campaign images appear on the homepage, not product cards.</p></div>
        <button type="button" className="btn btn-light" onClick={()=>set('newArrivalModels',[...(form.newArrivalModels||[]),{id:makeId('model'),title:'New Look',subtitle:'',kicker:'New season',image:'',active:true}])}><Plus size={16}/>Add Model</button>
      </div>
      <div className="settings-card-list">{(form.newArrivalModels||[]).map(item=><article key={item.id} className="settings-image-card"><img src={item.image||'https://placehold.co/600x800?text=Model'} alt=""/><div className="stack-form"><input placeholder="Title" value={item.title} onChange={event=>set('newArrivalModels',form.newArrivalModels.map(entry=>entry.id===item.id?{...entry,title:event.target.value}:entry))}/><input placeholder="Subtitle" value={item.subtitle||''} onChange={event=>set('newArrivalModels',form.newArrivalModels.map(entry=>entry.id===item.id?{...entry,subtitle:event.target.value}:entry))}/><input placeholder="Image URL" value={item.image} onChange={event=>set('newArrivalModels',form.newArrivalModels.map(entry=>entry.id===item.id?{...entry,image:event.target.value}:entry))}/><label className="btn btn-light btn-small"><ImagePlus size={14}/>Upload<input hidden type="file" accept="image/*" onChange={event=>uploadArrayImage(event.target.files?.[0],'newArrivalModels',item.id)}/></label><label className="check-card"><input type="checkbox" checked={item.active!==false} onChange={event=>set('newArrivalModels',form.newArrivalModels.map(entry=>entry.id===item.id?{...entry,active:event.target.checked}:entry))}/><span>Active</span></label><button type="button" className="icon-btn danger" onClick={()=>set('newArrivalModels',form.newArrivalModels.filter(entry=>entry.id!==item.id))}><Trash2/></button></div></article>)}</div>
    </div>

    <div className="settings-subsection">
      <div className="subsection-heading"><h3>Branding Banners</h3><button type="button" className="btn btn-light" onClick={()=>set('brandingBanners',[...(form.brandingBanners||[]),{id:makeId('banner'),title:'Campaign',subtitle:'',image:'',buttonText:'Explore',link:'/shop',active:true}])}><Plus size={16}/>Add Banner</button></div>
      <div className="settings-card-list">{(form.brandingBanners||[]).map(item=><article key={item.id} className="settings-image-card"><img src={item.image||'https://placehold.co/900x600?text=Banner'} alt=""/><div className="stack-form"><input placeholder="Title" value={item.title} onChange={event=>set('brandingBanners',form.brandingBanners.map(entry=>entry.id===item.id?{...entry,title:event.target.value}:entry))}/><input placeholder="Subtitle" value={item.subtitle||''} onChange={event=>set('brandingBanners',form.brandingBanners.map(entry=>entry.id===item.id?{...entry,subtitle:event.target.value}:entry))}/><input placeholder="Image URL" value={item.image} onChange={event=>set('brandingBanners',form.brandingBanners.map(entry=>entry.id===item.id?{...entry,image:event.target.value}:entry))}/><input placeholder="Link" value={item.link||''} onChange={event=>set('brandingBanners',form.brandingBanners.map(entry=>entry.id===item.id?{...entry,link:event.target.value}:entry))}/><button type="button" className="icon-btn danger" onClick={()=>set('brandingBanners',form.brandingBanners.filter(entry=>entry.id!==item.id))}><Trash2/></button></div></article>)}</div>
    </div>
  </div>}
  {tab==='footer'&&<div className="form-grid"><label className="full-field">Footer Description<textarea rows="3" value={form.footerDescription||''} onChange={event=>set('footerDescription',event.target.value)}/></label><label>Footer Contact Title<input value={form.footerContactTitle||''} onChange={event=>set('footerContactTitle',event.target.value)}/></label><label>Copyright Text<input value={form.footerText||''} onChange={event=>set('footerText',event.target.value)}/></label><label className="full-field">Footer Bottom Text<input value={form.footerBottomText||''} onChange={event=>set('footerBottomText',event.target.value)}/></label><label>Shop Column Title<input value={form.footerColumns?.[0]?.title||'Shop'} onChange={event=>set('footerColumns',[{...(form.footerColumns?.[0]||{}),title:event.target.value},{...(form.footerColumns?.[1]||{}),title:form.footerColumns?.[1]?.title||'Information'}])}/></label><label>Information Column Title<input value={form.footerColumns?.[1]?.title||'Information'} onChange={event=>set('footerColumns',[{...(form.footerColumns?.[0]||{}),title:form.footerColumns?.[0]?.title||'Shop'},{...(form.footerColumns?.[1]||{}),title:event.target.value}])}/></label><label className="full-field">Invoice Note<input value={form.invoiceNote||''} onChange={event=>set('invoiceNote',event.target.value)}/></label></div>}
  {tab==='social'&&<div>
    <div className="subsection-heading">
      <div>
        <h3>Social Links</h3>
        <p>Add Facebook, Instagram, WhatsApp, YouTube, TikTok or any other social profile.</p>
      </div>
      <button type="button" className="btn btn-light" onClick={addSocial}><Plus size={16}/>Add Social</button>
    </div>
    <div className="settings-list">
      {normalizeSocialLinks(form.socialLinks).map(item=><div className="social-settings-row" key={item.id}>
        <label>Platform<input placeholder="e.g. YouTube" value={item.platform} onChange={event=>updateSocial(item.id,{platform:event.target.value})}/></label>
        <label>Profile URL or number<input placeholder="https://... or WhatsApp number" value={item.url} onChange={event=>updateSocial(item.id,{url:event.target.value})}/></label>
        <label className="check-card"><input type="checkbox" checked={item.active!==false} onChange={event=>updateSocial(item.id,{active:event.target.checked})}/><span>Active</span></label>
        <button type="button" className="icon-btn danger" onClick={()=>removeSocial(item.id)} aria-label={`Delete ${item.platform||'social link'}`}><Trash2/></button>
      </div>)}
      {!normalizeSocialLinks(form.socialLinks).length&&<div className="notice">No social links yet. Click “Add Social” to create one.</div>}
    </div>
  </div>}
  {tab==='shipping'&&<div><div className="subsection-heading"><h3>Shipping Areas</h3><button type="button" className="btn btn-light" onClick={()=>set('shippingAreas',[...(form.shippingAreas||[]),{id:makeId('shipping'),name:'New Area',charge:0,estimate:'2–5 working days',active:true}])}><Plus size={16}/>Add Area</button></div><div className="settings-list">{(form.shippingAreas||[]).map(area=><div className="form-grid settings-row" key={area.id}><input value={area.name} onChange={event=>set('shippingAreas',form.shippingAreas.map(item=>item.id===area.id?{...item,name:event.target.value}:item))}/><input type="number" value={area.charge} onChange={event=>set('shippingAreas',form.shippingAreas.map(item=>item.id===area.id?{...item,charge:Number(event.target.value)}:item))}/><input value={area.estimate} onChange={event=>set('shippingAreas',form.shippingAreas.map(item=>item.id===area.id?{...item,estimate:event.target.value}:item))}/><label className="check-card"><input type="checkbox" checked={area.active} onChange={event=>set('shippingAreas',form.shippingAreas.map(item=>item.id===area.id?{...item,active:event.target.checked}:item))}/><span>Active</span></label><button type="button" className="icon-btn danger" onClick={()=>set('shippingAreas',form.shippingAreas.filter(item=>item.id!==area.id))}><Trash2/></button></div>)}</div></div>}
  {tab==='payment'&&<div><div className="subsection-heading"><h3>Payment Methods</h3><button type="button" className="btn btn-light" onClick={()=>set('paymentMethods',[...(form.paymentMethods||[]),{id:makeId('payment'),name:'New Method',enabled:true,accountNumber:'',instructions:'',requiresTransactionId:false}])}><Plus size={16}/>Add Method</button></div><div className="settings-list">{(form.paymentMethods||[]).map(method=><div className="form-grid settings-row payment-row" key={method.id}><input value={method.name} onChange={event=>set('paymentMethods',form.paymentMethods.map(item=>item.id===method.id?{...item,name:event.target.value}:item))}/><input placeholder="Account Number" value={method.accountNumber||''} onChange={event=>set('paymentMethods',form.paymentMethods.map(item=>item.id===method.id?{...item,accountNumber:event.target.value}:item))}/><input placeholder="Instructions" value={method.instructions||''} onChange={event=>set('paymentMethods',form.paymentMethods.map(item=>item.id===method.id?{...item,instructions:event.target.value}:item))}/><label className="check-card"><input type="checkbox" checked={method.enabled} onChange={event=>set('paymentMethods',form.paymentMethods.map(item=>item.id===method.id?{...item,enabled:event.target.checked}:item))}/><span>Enabled</span></label><label className="check-card"><input type="checkbox" checked={method.requiresTransactionId} onChange={event=>set('paymentMethods',form.paymentMethods.map(item=>item.id===method.id?{...item,requiresTransactionId:event.target.checked}:item))}/><span>Need Transaction ID</span></label><button type="button" className="icon-btn danger" onClick={()=>set('paymentMethods',form.paymentMethods.filter(item=>item.id!==method.id))}><Trash2/></button></div>)}</div></div>}
  {tab==='admin'&&<div className="form-grid"><label>Admin Email<input type="email" value={form.adminEmail||''} onChange={event=>set('adminEmail',event.target.value)}/></label><label>New Password<input type="password" placeholder="Leave blank to keep existing" value={form.adminPassword||''} onChange={event=>set('adminPassword',event.target.value)}/></label><label>Admin Login URL Slug<input value={form.adminLoginSlug||DEFAULT_ADMIN_LOGIN_SLUG} onChange={event=>set('adminLoginSlug',event.target.value.replace(/[^a-zA-Z0-9-_]/g,''))}/></label><div className="info-card full-field">New URL: <strong>{window.location.origin}{getAdminLoginPath(form)}</strong></div></div>}
  </section></form>;
}
