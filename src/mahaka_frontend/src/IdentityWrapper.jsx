import React, { useState, useEffect } from "react";
import { IdentityKitProvider, IdentityKitTheme } from "@nfid/identitykit/react";
import { IdentityKitAuthType, NFIDW, Plug } from "@nfid/identitykit";
import { Provider } from "react-redux";
import store from "./redux/store";
import App from "./App";
import { AuthProvider } from "./connect/useClient";

export default function IdentityWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  const canisterID = process.env.CANISTER_ID_MAHAKA_BACKEND;
  const signers = [NFIDW, Plug];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  return (
    <IdentityKitProvider
      signers={signers}
      theme={IdentityKitTheme.SYSTEM}
      authType={IdentityKitAuthType.DELEGATION}
      signerClientOptions={{
        targets: [canisterID], // Ensure the correct canister ID is used
      }}
    >
      <Provider store={store}>
        <AuthProvider>
          <App />
        </AuthProvider>
      </Provider>
    </IdentityKitProvider>
  );
}
