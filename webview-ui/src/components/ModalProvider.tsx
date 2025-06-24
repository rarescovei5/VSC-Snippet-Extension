// ModalProvider.tsx
import React from 'react';
import ReactDOM from 'react-dom';

interface ModalContextType {
  open: (children: React.ReactNode) => void;
  close: () => void;
}

const ModalContext = React.createContext<ModalContextType>({
  open: () => {},
  close: () => {},
});

export const useModal = () => React.useContext(ModalContext);

const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [modalContent, setModalContent] = React.useState<React.ReactNode | null>(null);

  const contextValue: ModalContextType = {
    open: setModalContent,
    close: () => setModalContent(null),
  };

  return (
    <ModalContext value={contextValue}>
      {children}
      {modalContent &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 bg-background/50 flex items-center justify-center z-50 !text-text">
            <div className="lg:min-w-md bg-background border border-border p-6 rounded shadow-lg">
              {modalContent}
              <button onClick={() => contextValue.close()} className="mt-4 cursor-pointer">
                Close
              </button>
            </div>
          </div>,
          document.body
        )}
    </ModalContext>
  );
};

export default ModalProvider;
