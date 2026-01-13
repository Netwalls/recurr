then if in cases where it can't mint then tell the users that they are ineligible because the have low score



Initiating File Scan: Untitled spreadsheet - Sheet1.csv
> File Type: CSV/Text detected.
> Analyzing 6 lines...
> === FIRST 50 LINES ===
> 0: "Date,Description,Debit,Credit,Balance"
> 1: "2024-03-01,OPENING BALANCE,,,1000000.00"
> 2: "2024-03-05,WIRE TRANSFER RECEIVED: ACME CORP,,250000.00,1250000.00"
> 3: "2024-03-10,CLOUD SERVICES BILLING,15000.00,,1235000.00"
> 4: "2024-03-15,VENDORS PAYMENT BATCH 1,45000.00,,1190000.00"
> 5: "2024-03-20,SERIES A FUNDING TRANCHE,,2000000.00,3190000.00"
> === END SAMPLE ===
> Format detected: CSV with columns
> Parsing CSV row-by-row...
> Column mapping: Date=0, Debit=2, Credit=3, Balance=4
> Parsed 2 credits, 2 debits
> Total Credits: $2,250,000
> Total Debits: $60,000
> Last Balance: $3,190,000
> Statement period: 19 days (~1 month)
> MONTHLY Revenue (Average): $2,250,000
> Minting Proof: 0.75 Score / $2250000 MRR / $3190000 Balance
> Sending on-chain verification...
> VERIFICATION ERROR: could not coalesce error (error={ "code": -32603, "message": "Internal JSON-RPC error." }, payload={ "id": 10, "jsonrpc": "2.0", "method": "eth_sendTransaction", "params": [ { "data": "0xd2c3aaf2000000000000000000000000c023b4a500ba76934f5e0489690d108335fa72300000000000000000000000000000000000000000000000000000000000225510000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000c8", "from": "0xc023b4a500ba76934f5e0489690d108335fa7230", "gas": "0x7a120", "to": "0xcb15193caf5f2a28c21b26f399b87e3ca450b55b" } ] }, code=UNKNOWN_ERROR, version=6.16.0)

infact i need to know how the frontend interacts with contract from t