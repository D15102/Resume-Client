import React, { useState, useRef, useEffect } from 'react';
import { FaBold, FaItalic, FaUnderline, FaAlignLeft, FaAlignCenter, FaAlignRight, FaListUl, FaListOl, FaIndent, FaOutdent, FaUndo, FaRedo, FaHeading, FaLink, FaImage, FaFont, FaPalette } from 'react-icons/fa';

interface WordEditorProps {
  initialContent: string;
  onContentChange?: (content: string) => void;
}

const WordEditor: React.FC<WordEditorProps> = ({ initialContent, onContentChange }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [backgroundColor, setBackgroundColor] = useState('transparent');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBackgroundColorPicker, setShowBackgroundColorPicker] = useState(false);
  const [showFontSizeMenu, setShowFontSizeMenu] = useState(false);
  const [showFontFamilyMenu, setShowFontFamilyMenu] = useState(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState('100%');

  // Font sizes and families
  const fontSizes = ['8px', '10px', '12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '36px', '48px', '64px'];
  const fontFamilies = ['Arial', 'Calibri', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Tahoma', 'Trebuchet MS', 'Impact', 'Comic Sans MS'];

  // Colors
  const colors = [
    '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
    '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
    '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
    '#dd7e6b', '#ea9999', '#f9cb9c', '#ffe599', '#b6d7a8', '#a2c4c9', '#a4c2f4', '#9fc5e8', '#b4a7d6', '#d5a6bd',
    '#cc4125', '#e06666', '#f6b26b', '#ffd966', '#93c47d', '#76a5af', '#6d9eeb', '#6fa8dc', '#8e7cc3', '#c27ba0',
    '#a61c00', '#cc0000', '#e69138', '#f1c232', '#6aa84f', '#45818e', '#3c78d8', '#3d85c6', '#674ea7', '#a64d79',
    '#85200c', '#990000', '#b45f06', '#bf9000', '#38761d', '#134f5c', '#1155cc', '#0b5394', '#351c75', '#741b47',
    '#5b0f00', '#660000', '#783f04', '#7f6000', '#274e13', '#0c343d', '#1c4587', '#073763', '#20124d', '#4c1130'
  ];

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.innerHTML = initialContent;
    }
  }, [initialContent]);

  const handleContentChange = () => {
    if (editorRef.current) {
      const newContent = editorRef.current.innerHTML;
      if (onContentChange) {
        onContentChange(newContent);
      }
    }
  };

  const execCommand = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    handleContentChange();
    editorRef.current?.focus();
  };

  const handleFontSizeChange = (size: string) => {
    // Apply font size directly
    execCommand('fontSize', size);
    setShowFontSizeMenu(false);
  };

  const handleFontFamilyChange = (family: string) => {
    setFontFamily(family);
    execCommand('fontName', family);
    setShowFontFamilyMenu(false);
  };

  const handleColorChange = (color: string) => {
    setTextColor(color);
    execCommand('foreColor', color);
    setShowColorPicker(false);
  };

  const handleBackgroundColorChange = (color: string) => {
    setBackgroundColor(color);
    execCommand('hiliteColor', color);
    setShowBackgroundColorPicker(false);
  };

  const handleAddLink = () => {
    if (linkUrl) {
      if (linkText) {
        // Create a new link with the specified text
        execCommand('insertHTML', `<a href="${linkUrl}" target="_blank">${linkText}</a>`);
      } else {
        // Apply link to selected text
        execCommand('createLink', linkUrl);
      }
      setIsLinkModalOpen(false);
      setLinkUrl('');
      setLinkText('');
    }
  };

  const handleAddImage = () => {
    if (imageUrl) {
      const imgHtml = `<img src="${imageUrl}" alt="${imageAlt}" style="width: ${imageWidth};" />`;
      execCommand('insertHTML', imgHtml);
      setIsImageModalOpen(false);
      setImageUrl('');
      setImageAlt('');
      setImageWidth('100%');
    }
  };

  return (
    <div className="border rounded-lg shadow-lg bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b bg-gray-50">
        {/* Text formatting */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('bold')}
          title="Bold"
        >
          <FaBold />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('italic')}
          title="Italic"
        >
          <FaItalic />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('underline')}
          title="Underline"
        >
          <FaUnderline />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Alignment */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('justifyLeft')}
          title="Align Left"
        >
          <FaAlignLeft />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('justifyCenter')}
          title="Align Center"
        >
          <FaAlignCenter />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('justifyRight')}
          title="Align Right"
        >
          <FaAlignRight />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Lists */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('insertUnorderedList')}
          title="Bullet List"
        >
          <FaListUl />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('insertOrderedList')}
          title="Numbered List"
        >
          <FaListOl />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Indentation */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('indent')}
          title="Increase Indent"
        >
          <FaIndent />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('outdent')}
          title="Decrease Indent"
        >
          <FaOutdent />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Undo/Redo */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('undo')}
          title="Undo"
        >
          <FaUndo />
        </button>
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => execCommand('redo')}
          title="Redo"
        >
          <FaRedo />
        </button>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Headings */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            onClick={() => execCommand('formatBlock', '<h2>')}
            title="Heading"
          >
            <FaHeading />
          </button>
        </div>

        {/* Font Size */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            onClick={() => setShowFontSizeMenu(!showFontSizeMenu)}
            title="Font Size"
          >
            <span className="text-xs mr-1">A</span>
            <span className="text-base">A</span>
          </button>
          {showFontSizeMenu && (
            <div className="absolute z-10 mt-1 w-32 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {fontSizes.map((size) => (
                <button
                  key={size}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleFontSizeChange(size)}
                  style={{ fontSize: size }}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Font Family */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            onClick={() => setShowFontFamilyMenu(!showFontFamilyMenu)}
            title="Font Family"
          >
            <FaFont />
          </button>
          {showFontFamilyMenu && (
            <div className="absolute z-10 mt-1 w-48 bg-white border rounded shadow-lg max-h-60 overflow-y-auto">
              {fontFamilies.map((family) => (
                <button
                  key={family}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                  onClick={() => handleFontFamilyChange(family)}
                  style={{ fontFamily: family }}
                >
                  {family}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Text Color */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            onClick={() => setShowColorPicker(!showColorPicker)}
            title="Text Color"
          >
            <FaPalette style={{ color: textColor }} />
          </button>
          {showColorPicker && (
            <div className="absolute z-10 mt-1 p-2 bg-white border rounded shadow-lg">
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-sm border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => handleColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Color */}
        <div className="relative">
          <button
            className="p-2 rounded hover:bg-gray-200 flex items-center"
            onClick={() => setShowBackgroundColorPicker(!showBackgroundColorPicker)}
            title="Highlight Color"
          >
            <span className="relative">
              <FaFont />
              <div
                className="absolute inset-0 opacity-30"
                style={{ backgroundColor: backgroundColor !== 'transparent' ? backgroundColor : '#ffff00' }}
              ></div>
            </span>
          </button>
          {showBackgroundColorPicker && (
            <div className="absolute z-10 mt-1 p-2 bg-white border rounded shadow-lg">
              <div className="grid grid-cols-10 gap-1">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="w-5 h-5 rounded-sm border border-gray-300"
                    style={{ backgroundColor: color }}
                    onClick={() => handleBackgroundColorChange(color)}
                    title={color}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="h-6 w-px bg-gray-300 mx-1"></div>

        {/* Link */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => setIsLinkModalOpen(true)}
          title="Insert Link"
        >
          <FaLink />
        </button>

        {/* Image */}
        <button
          className="p-2 rounded hover:bg-gray-200"
          onClick={() => setIsImageModalOpen(true)}
          title="Insert Image"
        >
          <FaImage />
        </button>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className="p-6 min-h-[500px] max-h-[700px] overflow-y-auto focus:outline-none border border-gray-200 rounded-lg bg-white shadow-inner"
        onInput={handleContentChange}
        onBlur={handleContentChange}
        style={{ fontFamily: fontFamily }}
      />

      {/* Link Modal */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Link</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
              <input
                type="text"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Text (optional)</label>
              <input
                type="text"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                placeholder="Link text"
                className="w-full p-2 border rounded"
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to use selected text</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsLinkModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddLink}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {isImageModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <h3 className="text-lg font-semibold mb-4">Insert Image</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={imageAlt}
                onChange={(e) => setImageAlt(e.target.value)}
                placeholder="Image description"
                className="w-full p-2 border rounded"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Width</label>
              <select
                value={imageWidth}
                onChange={(e) => setImageWidth(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="100%">100% (Full width)</option>
                <option value="75%">75%</option>
                <option value="50%">50%</option>
                <option value="25%">25%</option>
                <option value="auto">Auto</option>
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsImageModalOpen(false)}
                className="px-4 py-2 border rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAddImage}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Insert
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordEditor;
