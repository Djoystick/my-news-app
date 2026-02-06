import type { FC } from 'react';
import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.snow.css';
import './QuillEditor.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const QuillEditor: FC<QuillEditorProps> = ({ value, onChange }) => {
  const modules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ header: [1, 2, 3, false] }],
      ['link', 'image'],
      ['clean'],
    ],
  };

  const formats = [
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'code-block',
    'list',
    'header',
    'link',
    'image',
  ];

  return (
    <ReactQuill
      theme="snow"
      value={value}
      onChange={onChange}
      modules={modules}
      formats={formats}
      style={{ height: '300px', marginBottom: '50px' }}
    />
  );
};

