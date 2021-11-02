# CastingWords
CastingWords service 

CastingWords Automation Plan
==

## 本文件只公開部分資訊

1. 目前使用上傳至 Google Drive 的錄音檔分享網址建立訂單
> 檔名規則： {yyyy-mm-dd} {title}_{[speakers]}.{ext}
> （缺少要提醒聽打人員的 `notes`）
> （缺少送件、完成等狀態的註記）
> 

![](/images/1-1.png)
&emsp;`webViewLink` [前端](https://castingwords.com/store/API3/unsupported/testurl)會過 

![](/images/1-2.png)
&emsp;但後端處理失敗噴副檔名錯誤

![](/images/1-3.png)
&emsp;`webContentLink` 雖然前端噴方法錯誤


```
curl --data \
'{"api_key":#APIKEY, 
"url":"https://drive.google.com/uc?id=xxxxxxxx&export=download", 
"sku":"TRANS14", 
"title":"2021-01-27 Conversation", 
"names":["Audrey Tang", "XXXXX"], 
"notes":"Only Audrey`s voice is recorded......", 
"tags":"Interview"
}' \
https://castingwords.com/store/API4/order_url \
-H "Content-Type: application/json"
```
&emsp;但 [APIv4](https://castingwords.com/docs/developer/SimpleAPI.html) 可以成功 POST
&emsp;（文件隱藏參數測試出還支援： `title` `notes` `tags` 問客服知道支援： `name` | `names` 這陣列參數）
&emsp;後續可以 GET https://castingwords.com/store/API4/audiofile/{id}

![](/images/1-4.png)
&emsp;補充說明：當檔案大小大於 `100MB` 會需要點擊 [仍要下載](https://drive.google.com/uc?export=download&confirm=wyc3&id=XXXXXXXXXXX) 才能讀取到真正的檔案（`&confirm=` 4 碼變數來自於路徑 `/uc` 的 `download_warning_..._...` cookie 值）

```
{
  "audiofile": {
    "duration": "1",
    "notes": "",
    "originallink": "https://drive.google.com/uc?id=XXXXXXXXXXXXXexport=download",
    "description": "uc?id=XXXXXXXXXXX&export=download",
    "statename": "On Hold",
    "title": "2021 02 02 XXXXX visits",
    "names": "Audrey Tang|XXXX",
    "quality_stars": null,
    "id": 411736
  }
}
```

&emsp;補充說明：`names` 有遇過 POST 3 位 GET 6 位XD

2. 上傳錄音檔方式

* FTP

![](/images/2-1.png)
&emsp;&emsp;主動批次 [FTP](ftp://ftp.castingwords.com)

![](/images/2-2.png)
&emsp;&emsp;上傳完可以在後台看到檔案清單

![](/images/2-3.png)
&emsp;&emsp;選擇逐字稿專案類型後案子會進入購物車

![](/images/2-4.png)
&emsp;&emsp;點擊編輯項目資訊來編修本案細部參數後再進行送件付款

* RSS

![](/images/rss.png)
&emsp;&emsp;被動透過 [RSS](https://castingwords.com/docs/developer/RSS_Integration.html) 整合讓 CastingWords 每小時自動抓取

* 網頁

&emsp;&emsp;登入後選擇逐字稿專案類型後上傳

* API

![](/images/api.png)
&emsp;&emsp;透過 POST [API](https://castingwords.com/store/API4/order_url) 的 `url` 參數實現

3. 系統通知
> 目前信箱清單：[hide]

![](/images/3.png)
&emsp;狀態在完成時會寄通知信

> 逐字稿除了附件 `.txt` `.doc` 外有[獨立網址]（無需登入）(https://transcripts.castingwords.com/{order}/XXXXX.txt) 格式：txt、doc、rtf、html
> https://transcripts.castingwords.com/{order}/{audiofile.id}.{ext}


4. 憑證處理

![](/images/4-1.png)
&emsp;狀態在完成後會寄憑證給申請人
（也有訂單完成就先寄憑證的情況 此時 Status 欄位標示： `Credit Card Authorized, will charge on completion.`）

> 憑證除了附件外有[獨立網址]（需登入）(https://castingwords.com/store/customer/receipt?oid={order})
> https://castingwords.com/store/customer/receipt?oid={order}



