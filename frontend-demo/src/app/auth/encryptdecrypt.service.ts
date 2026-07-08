import { Injectable } from '@angular/core';
import * as CryptoJS from "crypto-js"
import { EncryptDecryptResponse } from '../models/response/EncryAndDecryResponse';
@Injectable({
  providedIn: 'root'
})
export class EncryptdecryptService {
  encryptanddecrptresponse:EncryptDecryptResponse = new EncryptDecryptResponse()
  key = CryptoJS.enc.Hex.parse('923D10CDCC3696B99466694DD226A5AAD9EA90241AB5142000365B9828FE377E');
  constructor() { }


  // public encryption(user: any) {
  //   var iv = CryptoJS.enc.Hex.parse(this.makeid());
  //   var message = JSON.stringify(user);
  //   var padMsg = this.padString(message);
  //   var encryptedd = CryptoJS.AES.encrypt(padMsg, this.key, {
  //     iv: iv,
  //     padding: CryptoJS.pad.Pkcs7,
  //     mode: CryptoJS.mode.CBC,
  //   });
  //   this.encryptanddecrptresponse = new EncryptDecryptResponse()
  //   this.encryptanddecrptresponse.data = encryptedd.toString()
  //   this.encryptanddecrptresponse.iv = iv.toString()
  //   return this.encryptanddecrptresponse
  // }

  public encryption(user: any) {
    var ivString = this.makeid().substring(0, 16);
    var iv = CryptoJS.enc.Utf8.parse(ivString);
    var message = JSON.stringify(user);
    var encryptedd = CryptoJS.AES.encrypt(message, this.key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    this.encryptanddecrptresponse =
      new EncryptDecryptResponse();
    this.encryptanddecrptresponse.data =
      encryptedd.toString();
    this.encryptanddecrptresponse.iv =
      CryptoJS.enc.Hex.stringify(iv);
    return this.encryptanddecrptresponse;
}

  // public  decryption(encryptedd: any, ivs?:any) {
  //   var decryptedd = CryptoJS.AES.decrypt(encryptedd, this.key, {
  //     keySize: 16,
  //     iv:  CryptoJS.enc.Hex.parse(ivs),
  //     mode: CryptoJS.mode.CBC,
  //     padding: CryptoJS.pad.Pkcs7,
  //   }).toString(CryptoJS.enc.Utf8);
  //   this.encryptanddecrptresponse.data = JSON.parse(decryptedd)
  //   return this.encryptanddecrptresponse
  // }

  public decryption(encryptedd: any, ivs?: any) {
  // Base64 padding fix
  while (encryptedd.length % 4 !== 0) {
    encryptedd += '=';
  }
  var decryptedd = CryptoJS.AES.decrypt(
    encryptedd,
    this.key,
    {
      keySize: 16,
      iv: CryptoJS.enc.Hex.parse(ivs),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }
  ).toString(CryptoJS.enc.Utf8);
  decryptedd = decryptedd.trim();
  this.encryptanddecrptresponse.data =
      JSON.parse(decryptedd);
  return this.encryptanddecrptresponse;
} 

  public passwordEncryption(data :any){
    var iv = CryptoJS.enc.Hex.parse('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789');
    var message = JSON.stringify(data);
    var padMsg = this.padString(message);
    var encryptedd = CryptoJS.AES.encrypt(padMsg, this.key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    this.encryptanddecrptresponse = new EncryptDecryptResponse()
    this.encryptanddecrptresponse.data = encryptedd.toString()
    this.encryptanddecrptresponse.iv = iv.toString()

    return this.encryptanddecrptresponse
  }

  public  passwordDecryption(encryptedd: any) {
    var decryptedd = CryptoJS.AES.decrypt(encryptedd, this.key, {
      keySize: 16,
      iv:  CryptoJS.enc.Hex.parse('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'),
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    }).toString(CryptoJS.enc.Utf8);
    this.encryptanddecrptresponse.data = JSON.parse(decryptedd)
    return this.encryptanddecrptresponse
  }

  makeid() {
    var text = '';
    var possible =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (var i = 0; i < 32; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    return text;
  }

  padString(source:any) {

    var paddingChar = ' ';

    var size = 16;

    var x = source.length % size;

    var padLength = size - x;



    for (var i = 0; i < padLength; i++) source += paddingChar;



    return source;

  }
}
