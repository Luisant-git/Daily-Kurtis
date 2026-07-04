import React, { useState, useEffect } from 'react';
import { Upload, Save, Megaphone } from 'lucide-react';
import { uploadFile } from '../api/order';
import API_BASE_URL from '../api/config';
import { toast } from 'react-toastify';

const Settings = () => {
  const [signatureUrl, setSignatureUrl] = useState('');
  const [codShippingCharge, setCodShippingCharge] = useState(0);
  const [announcement, setAnnouncement] = useState('');
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/settings`);
      const data = await response.json();
      if (data.signatureUrl) {
        setSignatureUrl(data.signatureUrl);
        setPreviewUrl(data.signatureUrl);
      }
      if (data.codShippingCharge !== undefined) {
        setCodShippingCharge(data.codShippingCharge);
      }
      if (data.announcement) {
        setAnnouncement(data.announcement);
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await uploadFile(file);
      setSignatureUrl(result.url);
      setPreviewUrl(result.url);
    } catch (error) {
      toast.error('Failed to upload signature');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signatureUrl,
          codShippingCharge: parseFloat(codShippingCharge) || 0,
          announcement
        })
      });
      toast.success('Settings saved successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to save settings');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleClear = async () => {
    setAnnouncement('');
    try {
      await fetch(`${API_BASE_URL}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          signatureUrl,
          codShippingCharge: parseFloat(codShippingCharge) || 0,
          announcement: ''
        })
      });
      toast.success('Announcement cleared!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to clear announcement');
    }
  };

  // Split announcement by newlines and filter out empty lines
  const announcementParts = announcement.split('\n').map(line => line.trim()).filter(line => line.length > 0);

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your application settings</p>
      </div>

        <div className="settings-content">
          <div className="settings-card" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                borderRadius: '10px', 
                backgroundColor: '#eff6ff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Megaphone size={24} color="#2563eb" />
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: '600' }}>Announcement Bar</h3>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', lineHeight: '1.5' }}>
                  Configure the scrolling announcement message displayed at the top of your storefront
                </p>
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor="announcement" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', fontSize: '14px', color: '#374151' }}>
                Announcement Message
              </label>
              <textarea
                id="announcement"
                className="form-control"
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="Enter one announcement per line"
                rows="5"
                disabled={!isEditing}
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  border: '1px solid #d1d5db', 
                  width: '100%',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                  backgroundColor: isEditing ? '#fff' : '#f9fafb',
                  opacity: isEditing ? 1 : 0.7,
                  cursor: isEditing ? 'text' : 'not-allowed'
                }}
              />
              <p style={{ marginTop: '8px', fontSize: '13px', color: '#6b7280', lineHeight: '1.4' }}>
                Each line will be displayed as a separate announcement. The ✦ separator is added automatically.
              </p>
            </div>

            {announcementParts.length > 0 && (
              <div style={{ 
                padding: '16px', 
                backgroundColor: '#f8fafc', 
                borderRadius: '8px', 
                border: '1px solid #e5e7eb',
                marginBottom: '16px'
              }}>
                <p style={{ margin: '0 0 10px 0', fontSize: '12px', fontWeight: '600', color: '#4b5563', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Live Preview
                </p>
                <div style={{ 
                  backgroundColor: '#2563eb', 
                  color: 'white', 
                  padding: '10px 14px', 
                  borderRadius: '6px', 
                  fontSize: '12px',
                  overflow: 'hidden',
                  boxShadow: '0 2px 4px rgba(37, 99, 235, 0.2)'
                }}>
                  <div style={{ whiteSpace: 'nowrap', animation: 'marquee 20s linear infinite' }}>
                    {announcementParts.map((part, index) => (
                      <span key={index}>
                        {index > 0 && <span style={{ margin: '0 8px' }}>✦</span>}
                        {part}
                      </span>
                    ))}
                    <span style={{ margin: '0 8px' }}>✦</span>
                    {announcementParts.map((part, index) => (
                      <span key={`dup-${index}`}>
                        {index > 0 && <span style={{ margin: '0 8px' }}>✦</span>}
                        {part}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              {isEditing ? (
                <button 
                  className="btn btn-primary" 
                  onClick={handleSave}
                  style={{ 
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Save size={16} />
                  Apply Announcement
                </button>
              ) : (
                <button 
                  className="btn btn-primary" 
                  onClick={handleEdit}
                  style={{ 
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {announcement ? 'Edit Announcement' : 'Set Announcement'}
                </button>
              )}
              
              {!isEditing && announcement && (
                <button 
                  onClick={handleClear}
                  style={{ 
                    backgroundColor: '#dc2626',
                    color: 'white',
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>

          <div className="settings-card">
            <h3>Invoice Signature</h3>
            <p className="settings-description">Upload signature image to appear on invoices</p>
          
          <div className="signature-upload">
            <input
              type="file"
              id="signature-upload"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <label htmlFor="signature-upload" className="upload-btn">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Upload Signature'}
            </label>

            {previewUrl && (
              <div className="signature-preview">
                <img src={previewUrl} alt="Signature" />
              </div>
            )}
          </div>
        </div>

        <div className="settings-card" style={{ marginTop: '24px' }}>
          <h3>COD Settings</h3>
          <p className="settings-description">Manage Cash on Delivery options</p>
          
          <div className="cod-settings-field" style={{ marginBottom: '20px' }}>
            <label htmlFor="cod-charge" style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>
              COD Shipping Charge (Additional)
            </label>
            <input
              type="number"
              id="cod-charge"
              className="form-control"
              value={codShippingCharge}
              onChange={(e) => setCodShippingCharge(e.target.value)}
              placeholder="Enter amount (e.g. 50)"
              style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', width: '200px' }}
            />
          </div>

          <button 
            className="btn btn-primary save-btn" 
            onClick={handleSave}
          >
            <Save size={20} />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;