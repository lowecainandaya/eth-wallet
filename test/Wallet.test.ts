import { describe, it, expect} from "vitest";
import  Wallet from "./Wallet";
import { ethers } from "ethers";
import {abi, bin} from "./tokenBin";

const provider = new Wallet.Provider();

const wallet0 = new ethers.Wallet("0x20f6b3e0228e35d7d75188259a3b468bf4c006602b8c3d2fdd3408409dd52052",provider);
const wallet1 = new ethers.Wallet("0x75d65b3f43b5a97104270f05d61fb18c767169848d82d59d5e320e47e3f69738",provider);
const wallet = new Wallet(wallet0,provider);

describe("Test Wallet", async () => {
   
   it("Wallet Metadatadata", async () => {
      expect(wallet.address).toBe("0xCca5969eF9abE5F281763D547b1255278E72b980");
      expect(wallet.address.length).toBe(42);
      expect(wallet.privateKey).toBe("0x20f6b3e0228e35d7d75188259a3b468bf4c006602b8c3d2fdd3408409dd52052");
      expect(wallet.privateKey.length).toBe(66);
   })
   
   it("Test Wallet UseAs and useAt", () => {
      const walletOriginal = new Wallet(wallet0, provider);
      // new Wallet 
      const newWallet = walletOriginal.useAs(wallet1)
      const sameWalletNewProvider = walletOriginal.useAt("http://localhost:8000");
      // expect wallet to be not equal
      expect(newWallet.privateKey).not.toBe(walletOriginal.privateKey);
      // expect sameWalletNewProvider to have deferent Provider 
      expect(sameWalletNewProvider.provider.connection.url).toBe("http://localhost:8000");
   })
   
   it("Change Wallet and Provider", () => {
      const wallet = new Wallet(wallet0, provider);
      // make a copy of the original
      const original = wallet;
      // switch account
      wallet.switchAccount("0x75d65b3f43b5a97104270f05d61fb18c767169848d82d59d5e320e47e3f69738");
      expect(wallet.address).toBe(wallet1.address);
      wallet.switchNetwork("http://localhost:8000");
      expect(wallet.provider.connection.url).toBe("http://localhost:8000");
   })
   
   
})



describe("Real Transaction  of Wallet", async () => {
   const provider = new Wallet.Provider();
   const amountFormat = new Wallet.Format("0.000-000-0001");
   it("Send Ether with generic types ", async () => {
      const transaction =  await wallet.send("0.000-000-0001",wallet1.address);
     expect(transaction.Transaction.amount).toBe(amountFormat.wei);
     expect(transaction.Transaction.done).toBe(true);
      console.log(transaction);
   })
   
   it("send Ether with complex types", async () => {
      const transaction = await wallet.send(new Wallet.Format("0.000-000-0001"),wallet1);
     expect(transaction.Transaction.amount).toBe(amountFormat.wei);
     expect(transaction.Transaction.done).toBe(true);
      console.log(transaction);
   })
   
   it("send Ether using BigNumber", async () => {
      const amountFormat = new Wallet.Format.Wei("1000000");
      const transaction = await wallet.send(ethers.BigNumber.from('1000000'),wallet1);
      expect(transaction.Transaction.amount).toBe(amountFormat.wei);
     expect(transaction.Transaction.done).toBe(true);
   })
})

describe("Estimate Gas", async () => {
   const provider = new Wallet.Provider();
   
   it('Estimate Gas using generic types',async () => {
      const gasFee = await wallet.estimateGas("0.0001",wallet1.address);
      const estimatedGas =  gasFee.estimatedGas;
      const toSpend = gasFee.toSpend;
      
      const total = Wallet.utils.BN(toSpend).add(estimatedGas).toString();
      expect(total).toBe(gasFee.totalWei);
      console.log({gasFee})
   })
   
   it("test estimate gas using complex types", async () => {
      const gasFee = await wallet.estimateGas(new Wallet.Format("0.000-000-0001"),wallet1);
      const estimatedGas =  gasFee.estimatedGas;
      const toSpend = gasFee.toSpend;
      
      const total = Wallet.utils.BN(toSpend).add(estimatedGas).toString();
      expect(total).toBe(gasFee.totalWei);
      console.log({gasFee})
   })
   
   it("test estimate gas using BigNumber", async () => {
      const gasFee = await wallet.estimateGas(Wallet.utils.BN("1000000"),wallet1);
      const estimatedGas =  gasFee.estimatedGas;
      const toSpend = gasFee.toSpend;
      
      const total = Wallet.utils.BN(toSpend).add(estimatedGas).toString();
      expect(total).toBe(gasFee.totalWei);
      console.log({gasFee})
   })
   
})


describe("Transfer Token", async () => {
   const tokenFactory = new ethers.ContractFactory(abi,bin,wallet0);
   const _token = await tokenFactory.deploy();
   const token = wallet.Token(_token);
   
   
   // send token 
   it("send token using generic types", async () => {
      const amountFormat = new Wallet.Format("0.000-000-0001");
      const transferToken = await token.send("0.000-000-0001", wallet1.address);
      // expect the amount to transfer is 0.0000000001
      expect(transferToken.Transaction.amount).toBe(amountFormat.wei);
      // expect transaction value is 0.0000000001
      expect(transferToken.Transaction.done).toBe(true);
      console.log({transferToken});
   })
   // uaing complex type
   it("send token using complex types", async () => {
      const amountFormat = new Wallet.Format("0.000-000-0001");
      const transferToken = await token.send(new Wallet.Format("0.000-000-0001"), wallet1);
      // expect the amount to transfer is 0.0000000001
      expect(transferToken.Transaction.amount).toBe(amountFormat.wei);
      // expect transaction value is 0.0000000001
      expect(transferToken.Transaction.done).toBe(true);
      console.log({transferToken});
   })
   // using BigNumber
   it("send token using complex types with BigNumber", async () => {
      const amountFormat = new Wallet.Format.Wei('100000000');
      const transferToken = await token.send(ethers.BigNumber.from("100000000"), wallet1.address);
      // expect the amount to transfer is 0.0000000001
      expect(transferToken.Transaction.amount).toBe(amountFormat.wei);
      // expect transaction value is 0.0000000001
      expect(transferToken.Transaction.done).toBe(true);
      console.log({transferToken});
   })
   
   it('Estimate Token Gas using generic types',async () => {
      const gasFee = await token.estimateGas("0.0001",wallet1.address);
      const estimatedGas =  gasFee.estimatedGas;
      const toSpend = gasFee.toSpend;
      
      const total = Wallet.utils.BN(toSpend).add(estimatedGas).toString();
      expect(total).toBe(gasFee.totalWei);
      console.log({gasFee})
   })
   
});