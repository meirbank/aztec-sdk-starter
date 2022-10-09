import type { NextPage } from "next";
import { ethers } from "ethers";
import { JsonRpcSigner, Web3Provider } from "@ethersproject/providers";
import { useEffect, useState } from "react";
import {
  AccountId,
  AztecSdk,
  AssetValue,
  createAztecSdk,
  EthersAdapter,
  EthereumProvider,
  SdkFlavour,
  AztecSdkUser,
  GrumpkinAddress,
  SchnorrSigner,
  EthAddress,
  TxSettlementTime,
  virtualAssetIdPlaceholder,
  BridgeCallData,
  DefiSettlementTime
} from "@aztec/sdk";
import { Button, ButtonGroup } from '@chakra-ui/react'
import { Grid, GridItem } from '@chakra-ui/react'
import { Heading } from '@chakra-ui/react'
import { randomBytes } from "crypto";
import { Center, Square, Circle } from '@chakra-ui/react'
import {
  depositEthToAztec,
  registerAccount,
} from "./utils";



const nftABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_symbol",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "Approval",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "owner",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "ApprovalForAll",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "Transfer",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "spender",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "name": "balanceOf",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentTokenId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "getApproved",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "isApprovedForAll",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "mint",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "name",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "ownerOf",
    "outputs": [
      {
        "internalType": "address",
        "name": "owner",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "safeTransferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "operator",
        "type": "address"
      },
      {
        "internalType": "bool",
        "name": "approved",
        "type": "bool"
      }
    ],
    "name": "setApprovalForAll",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "interfaceId",
        "type": "bytes4"
      }
    ],
    "name": "supportsInterface",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "symbol",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "tokenURI",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "from",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "id",
        "type": "uint256"
      }
    ],
    "name": "transferFrom",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]

const bridgeReadAbi = [
  {
            "inputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ],
            "stateMutability": "view",
            "type": "function",
            "name": "owners",
            "outputs": [
              {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
              }
            ]
          }
  ];

const Home: NextPage = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [hasMetamask, setHasMetamask] = useState(false);
  const [signer, setSigner] = useState<null | JsonRpcSigner>(null);
  const [ethereumProvider, setEthereumProvider] =
    useState<null | EthereumProvider>(null);
  const [ethAccount, setEthAccount] = useState<EthAddress | null>(null);
  const [sdk, setSdk] = useState<null | AztecSdk>(null);
  const [account0, setAccount0] = useState<AztecSdkUser | null>(null);
  const [userExists, setUserExists] = useState<boolean>(false);
  const [accountPrivateKey, setAccountPrivateKey] = useState<Buffer | null>(null);
  const [accountPublicKey, setAccountPublicKey] = useState<GrumpkinAddress | null>(null);
  const [spendingSigner, setSpendingSigner] = useState<SchnorrSigner | undefined>(undefined);
  const [alias, setAlias] = useState("");
  const [amount, setAmount] = useState(0);
  const [virtualAssetId, setVirtualAssetId] = useState(0);
  const [nftPortfolio, setNftPortfolio] = useState<object[]>(
    []
  );


  const baseuri = "https://bafybeighak7n5qxop5cuz2hcnyqweq6sdsczdahhzhnjqmbt7sm5qecf4y.ipfs.dweb.link/Zkunks-metadata/"
  async function getNFTData(id){
    return fetch(`${baseuri}${id}.json`)
    .then((response) => response.json())
    .then((responseJson) => {
      return responseJson;
    })
    .catch((error) => {
      console.error(error);
    });
  }

  async function loadNFTs(nftIds){
    const arr = []
    for (var i =0; i< nftIds.length; i++){
      const obj = await getNFTData(nftIds[i]);
      console.log("Obj", obj)
      arr.push(obj)
    }

    setNftPortfolio(arr)
    console.log("NFT PORT", nftPortfolio, arr, typeof nftPortfolio, typeof arr)
  }

  useEffect(() => {
    if (typeof window.ethereum !== "undefined") {
      setHasMetamask(true);
    }
    
    window.ethereum.on("accountsChanged", () => location.reload());
  }, []);

  async function connect() {
    setConnecting(true);
    if (typeof window.ethereum !== "undefined") {
      try {
        let accounts = await ethereum.request({
          method: "eth_requestAccounts",
        });
        setEthAccount(EthAddress.fromString(accounts[0]));


        const ethersProvider: Web3Provider = new ethers.providers.Web3Provider(
          window.ethereum
        );
        const ethereumProvider: EthereumProvider = new EthersAdapter(
          ethersProvider
        );

        const sdk = await createAztecSdk(ethereumProvider, {
          serverUrl: "https://api.aztec.network/aztec-connect-testnet/falafel", // goerli testnet
          pollInterval: 1000,
          memoryDb: true,
          debug: "bb:*",
          flavour: SdkFlavour.PLAIN,
          minConfirmation: 1, // ETH block confirmations
        });

        await sdk.run();

        console.log("Aztec SDK initialized", sdk);
        setIsConnected(true);
        setSigner(ethersProvider.getSigner());
        setEthereumProvider(ethereumProvider);
        setSdk(sdk);
      } catch (e) {
        console.log(e);
      }
    } else {
      setIsConnected(false);
    }
    setConnecting(false);
  }

  async function login() {
    const { publicKey: pubkey, privateKey } = await sdk!.generateAccountKeyPair(ethAccount!)
    console.log("privacy key", privateKey);
    console.log("public key", pubkey.toString());

    setAccountPrivateKey(privateKey);
    setAccountPublicKey(pubkey);
  }

  async function initUsersAndPrintBalances() {

    let account0 = (await sdk!.userExists(accountPublicKey!))
      ? await sdk!.getUser(accountPublicKey!)
      : await sdk!.addUser(accountPrivateKey!);

    setAccount0(account0!);

    console.log(account0);

    if ((await sdk?.isAccountRegistered(accountPublicKey!)))
      setUserExists(true);

    await account0.awaitSynchronised();
    // Wait for the SDK to read & decrypt notes to get the latest balances
    console.log(
      "zkETH balance",
      sdk!.fromBaseUnits(
        await sdk!.getBalance(account0.id, sdk!.getAssetIdBySymbol("ETH"))
      )
    );

    getBalance();

  }


  async function mint(){

    const nftBridge = new BridgeCallData(44, 0, virtualAssetIdPlaceholder, undefined, undefined, 0);

    let bridge = nftBridge;

    const tokenAssetValue: AssetValue = {
      assetId: 0,
      value: 1000000000000000n,
    };

    const fee = (await sdk.getDefiFees(bridge))[DefiSettlementTime.INSTANT];
    console.log("create defi controller",       accountPublicKey,
    spendingSigner,
    bridge,
    tokenAssetValue,
    fee)
    console.log("signer", signer, spendingSigner)
    const controller = sdk.createDefiController(
      accountPublicKey,
      spendingSigner,
      bridge,
      tokenAssetValue,
      fee
    );
    await controller.createProof();
    const txId = await controller.send();
    console.log(
      "View transaction on the block explorer",
      `tx/${txId.toString()}`
    );

  }

  async function getBalance(){

    let balance = sdk.fromBaseUnits(
      await sdk.getBalance(
        accountPublicKey,
        sdk.getAssetIdBySymbol("ETH")
      )
    );

    let spendableAccountSum = sdk.fromBaseUnits({
      assetId: 0,
      value: await sdk.getSpendableSum(accountPublicKey, 0, false),
    });

    let spendableSpendingKeySum = sdk.fromBaseUnits({
      assetId: 0,
      value: await sdk.getSpendableSum(accountPublicKey, 0, true),
    });

    let pendingSpendingKeySum = sdk.fromBaseUnits({
      assetId: 0,
      value: await sdk.getSpendableSum(
        accountPublicKey,
        0,
        true,
        false
      ),
    });

    const padding = 50;

    console.log(`Total zkETH Balance:`.padEnd(padding, " "), balance);
    console.log(
      "Spendable base account zkETH Balance:".padEnd(padding, " "),
      spendableAccountSum
    );
    console.log(
      "Spendable registered account zkETH Balance:".padEnd(padding, " "),
      spendableSpendingKeySum
    );
    console.log(
      "Pending registered account zkETH Balance:".padEnd(padding, " "),
      pendingSpendingKeySum
    );

    const defiTxs = await sdk.getDefiTxs(accountPublicKey);

    console.log(defiTxs)

    let interactionNonces = [];


    for (var i=0; i < defiTxs.length; i++){
      if (defiTxs[i].interactionResult.interactionNonce){
        interactionNonces.push(defiTxs[i].interactionResult.interactionNonce);
      }
    }
    console.log("nonces", interactionNonces)

    let realNftIds = [];
    for (var i=0; i< interactionNonces.length; i++){
      let myNftId = await mapVirtualAssetToNFT(interactionNonces[i]);
      console.log("NFT ID Result", myNftId)
      if (myNftId > 0) {
        realNftIds.push(myNftId);
      }
    }
    console.log("Nft ids", realNftIds)

    loadNFTs(realNftIds);
  }

  async function mapVirtualAssetToNFT(id){
    const bridgeAddress = "0xb6cd5313407f9930229a64336495121ba5b3a248";
    const bridgeContract = new ethers.Contract(bridgeAddress, bridgeReadAbi, signer);
    const nftId = await bridgeContract.owners(id);
    console.log("Mapping for ", id, nftId.toNumber());
    return nftId.toNumber()
  }

  async function sanityCheckIfNFTExists(){
    const nftAddress = "0x2A4B8866C05b087D3779e200aa6f928B4C846A02";
    const nftContract = new ethers.Contract(nftAddress, nftABI, signer);
    //const newNFT = await nftContract.mint();
    // console.log("new ft",  newNFT)
    const nftId = await nftContract.currentTokenId();
    const nftname = await nftContract.name();
    console.log("NFT id sanity check", nftId.toNumber(), nftname);

  }

  async function getSpendingKey() {
    const { privateKey } = await sdk!.generateSpendingKeyPair(ethAccount!);
    const signer = await sdk?.createSchnorrSigner(privateKey);
    console.log("signer added", signer);
    setSpendingSigner(signer);
  }

  async function registerNewAccount() {
    const depositTokenQuantity: bigint = ethers.utils
      .parseEther(amount.toString())
      .toBigInt();
    const recoverySigner = await sdk!.createSchnorrSigner(randomBytes(32));
    let recoverPublicKey = recoverySigner.getPublicKey();
    let txId = await registerAccount(
      accountPublicKey!,
      alias,
      accountPrivateKey!,
      spendingSigner!.getPublicKey(),
      recoverPublicKey,
      EthAddress.ZERO,
      depositTokenQuantity,
      TxSettlementTime.NEXT_ROLLUP,
      ethAccount!,
      sdk!
    );
    console.log("registration txId", txId);
    console.log(
      "lookup tx on explorer",
      `https://aztec-connect-testnet-explorer.aztec.network/goerli/tx/${txId.toString()}`
    );
  }

  async function depositEth() {
    const depositTokenQuantity: bigint = ethers.utils
      .parseEther(amount.toString())
      .toBigInt();

    let txId = await depositEthToAztec(
      ethAccount!,
      accountPublicKey!,
      depositTokenQuantity,
      TxSettlementTime.NEXT_ROLLUP,
      sdk!,
    );

    console.log("deposit txId", txId);
    console.log(
      "lookup tx on explorer",
      `https://aztec-connect-testnet-explorer.aztec.network/goerli/tx/${txId.toString()}`
    );
  }

  return (
    <div>
      {sdk ? (
        <Center style={{padding:50, margin:"0 auto", width:"100%"}}>
          {(accountPrivateKey && !account0)? (
            <Button onClick={() => initUsersAndPrintBalances()}>
              initialize
            </Button>
          ) : (
            ""
          )}
          {(!accountPrivateKey) ? (
            <Button onClick={() => login()}>Login</Button>
          ) : (
            ""
          )}

          {spendingSigner && account0 ? (

            
            <Button onClick={() => mint()}>
            Mint
          </Button>

          ) : (
            ""
          )}
          {spendingSigner && !userExists ? (
            <form>
              <label>
                Alias:
                <input
                  type="text"
                  value={alias}
                  onChange={(e) => setAlias(e.target.value)}
                />
              </label>
            </form>
          ) : (
            ""
          )}
          {!spendingSigner && account0 ? (
            <Button onClick={() => getSpendingKey()}>
              Create Spending Key (Signer)
            </Button>
          ) : (
            ""
          )}
        </Center>
      ) : (
        ""
      )}
      
      <Center>
      {hasMetamask ? (
        isConnected ? (
          "Connected! "
        ) :  connecting? ("") : (
          <Button style={{marginTop:50}} onClick={() => connect()}>Connect</Button>
        )
      ) : (
        "Please install metamask"
      )}
      {connecting ? <p style={{marginTop:50}}>Please wait, setting up Aztec</p> : ""}
      </Center>
      

<div style={{margin:20}}>
{(nftPortfolio && nftPortfolio.length > 0) && <Center><Heading>My Portfolio</Heading></Center>}
<br/>
<Grid templateColumns='repeat(5, 1fr)' gap={6}>
{nftPortfolio && nftPortfolio.map((item, i) => (<GridItem w='100%' h='10' bg='blue.500'><img style={{width:400}} src={item.image}/><p><b>Zk</b>unk{item.name}</p></GridItem> )) }
</Grid>
</div>
    </div>
  );
};

export default Home;
