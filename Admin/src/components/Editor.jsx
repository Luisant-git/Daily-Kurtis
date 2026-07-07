import React from 'react';
import ReactQuill from 'react-quill-new';
import 'quill/dist/quill.snow.css';

const modules = {
  toolbar: [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ color: [] }, { background: [] }],
    [{ list: 'ordered' }, { list: 'bullet' }],
    [{ align: ['left', 'center', 'right', 'justify'] }],
    [{ size: ['small', false, 'large', 'huge'] }],
    ['link'],
    ['blockquote', 'code-block'],
    [{ indent: '-1' }, { indent: '+1' }],
    ['clean'],
    ['undo', 'redo'],
  ],
  clipboard: {
    matchVisual: false,
  },
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'color', 'background',
  'list', 'bullet',
  'align',
  'size',
  'link',
  'blockquote', 'code-block',
  'indent',
];

const Editor = ({ value, onChange, placeholder, style }) => {
  return (
    <div className="rich-editor-wrapper" style={style}>
      <ReactQuill
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