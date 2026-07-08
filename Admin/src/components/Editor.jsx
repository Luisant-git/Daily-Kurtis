import React, { useEffect, useRef } from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';

// Simplified toolbar without complex dropdowns
const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: [] }],
    ['link', 'blockquote', 'code-block'],
    ['clean'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'header', 'bold', 'italic', 'underline', 'strike',
  'color', 'background', 'list', 'bullet',
  'align', 'link', 'blockquote', 'code-block',
];

const Editor = ({ value, onChange, placeholder, style, compact = false }) => {
  const quillRef = useRef(null);

  useEffect(() => {
    // Add custom styles for editor height
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      .ql-editor {
        min-height: ${compact ? '150px' : '300px'} !important;
        max-height: ${compact ? '250px' : '500px'};
        overflow-y: auto;
        font-size: 14px;
        line-height: 1.6;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      }
      
      .ql-container {
        min-height: ${compact ? '150px' : '300px'} !important;
        border-radius: 0 0 8px 8px;
      }
      
      .ql-toolbar {
        border-radius: 8px 8px 0 0;
        background: #f9fafb;
        border: 1px solid #d1d5db;
        border-bottom: none;
      }
      
      .ql-container.ql-snow {
        border: 1px solid #d1d5db;
        border-top: none;
      }
      
      .ql-editor.ql-blank::before {
        color: #9ca3af;
        font-style: italic;
      }
      
      .ql-toolbar button {
        border-radius: 4px;
        padding: 2px 4px;
      }
      
      .ql-toolbar button:hover {
        background: #e5e7eb;
      }
      
      .ql-toolbar button.ql-active {
        background: #dbeafe;
        color: #3b82f6;
      }
      
      .ql-picker {
        border-radius: 4px;
        border: 1px solid #e5e7eb;
      }
      
      .ql-picker:hover {
        border-color: #d1d5db;
      }
      
      .ql-picker-label {
        padding: 4px 8px;
      }
      
      .ql-color .ql-picker-options,
      .ql-background .ql-picker-options {
        padding: 4px;
        border-radius: 8px;
      }
      
      ${compact ? `
        .ql-toolbar {
          padding: 4px 8px;
        }
        .ql-toolbar .ql-formats {
          margin-right: 4px;
        }
        .ql-editor {
          font-size: 13px;
        }
      ` : ''}
    `;
    document.head.appendChild(styleEl);

    // Force fix dropdown labels after render
    const fixLabels = () => {
      document.querySelectorAll('.ql-picker-label').forEach(label => {
        const span = label.querySelector('span');
        if (span && (!span.textContent || span.textContent === 'undefined')) {
          const picker = label.closest('.ql-picker');
          if (picker) {
            if (picker.classList.contains('ql-header')) {
              span.textContent = 'Normal';
            } else if (picker.classList.contains('ql-align')) {
              span.textContent = 'Normal';
            }
          }
        }
      });
    };

    const timer = setTimeout(fixLabels, 200);
    const timer2 = setTimeout(fixLabels, 500);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
      styleEl.remove();
    };
  }, [compact]);

  return (
    <div style={{ width: '100%', ...style }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || 'Enter product description...'}
      />
    </div>
  );
};

export default Editor;