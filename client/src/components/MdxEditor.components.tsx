import React from 'react';
import {
  BlockTypeSelect,
  BoldItalicUnderlineToggles,
  CreateLink,
  MDXEditor,
  UndoRedo,
  headingsPlugin,
  linkDialogPlugin,
  linkPlugin,
  listsPlugin,
  ListsToggle,
  quotePlugin,
  thematicBreakPlugin,
  StrikeThroughSupSubToggles,
  InsertTable,
  tablePlugin,
  markdownShortcutPlugin,
  toolbarPlugin,
  InsertImage,
  imagePlugin,
} from '@mdxeditor/editor';
import '@mdxeditor/editor/style.css';

type MdxEditorComponentProps = {
  onChange: (value: string) => void;
  initialContent: string;
};

const MdxEditorComponent: React.FC<MdxEditorComponentProps> = ({
  onChange,
  initialContent,
}) => {
  const handleChange = (content: string) => {
    onChange(content);
  };

  return (
    <MDXEditor
      contentEditableClassName="prose"
      markdown={initialContent}
      onChange={handleChange}
      plugins={[
        imagePlugin({
          imageAutocompleteSuggestions: ['/'],
        }),
        headingsPlugin(),
        listsPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        tablePlugin(),
        markdownShortcutPlugin(),
        toolbarPlugin({
          toolbarContents: () => (
            <div className="flex w-full items-center justify-start gap-2 rounded-md border border-gray-300 bg-white p-2">
              <UndoRedo />
              <BoldItalicUnderlineToggles />
              <BlockTypeSelect />
              <CreateLink />
              <ListsToggle />
              <InsertTable />
              <StrikeThroughSupSubToggles />
              <InsertImage />
            </div>
          ),
        }),
      ]}
    />
  );
};

export default MdxEditorComponent;
