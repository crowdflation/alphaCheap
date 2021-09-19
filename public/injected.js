(async function() {
  let publicKey = document.getElementById('_injectedPublicKey').innerText;

  // @ts-ignore
  if(!window.ethereum) {
    document.dispatchEvent(new CustomEvent('returnSignedCertificate', { detail: {found: false} }));
    return;
  }
  try {

    // @ts-ignore
    const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
    const account = accounts[0];

    const dataToSign = JSON.stringify({
      domain: {
        // Defining the chain
        chainId: 1,
        // Give a user friendly name to the specific contract you are signing for.
        name: 'Alpha Cheap',
        // Just let's you know the latest version. Definitely make sure the field name is correct.
        version: '1',
      },
      // Defining the message signing data content.
      message: {
        publicKey
      },
      // Refers to the keys of the *types* object below.
      primaryType: 'Mail',
      types: {
        EIP712Domain: [
          {name: 'name', type: 'string'},
          {name: 'version', type: 'string'},
          {name: 'chainId', type: 'uint256'},
        ],
        // Refer to PrimaryType
        Mail: [
          {name: 'publicKey', type: 'string'},
        ],
      },
    });

    // @ts-ignore
    const result = await window.ethereum.request(
      {
        method: "eth_signTypedData_v4",
        params: [account, dataToSign],
        from: account
      });
    const signature = result.substring(2);
    const r = "0x" + signature.substring(0, 64);
    const s = "0x" + signature.substring(64, 128);
    const v = parseInt(signature.substring(128, 130), 16);
    // The signature is now comprised of r, s, and v.
    var data = {
      publicKeySigned: {r, s, v},
      walletAddress: account,
      walletPublicKey: account,
      found: true,
    };

    document.dispatchEvent(new CustomEvent('returnSignedCertificate', {detail: data}));
  } catch (e) {
    alert('Error signing data, please make sure you have Ethereum account selected up in Metamask');
    //TODO: Log errors to server to develop better help for users
    console.error('Error Signing Certificate',e);
  }
})();