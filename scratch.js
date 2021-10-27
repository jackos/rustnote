import * as net from "net"

const utfDat = Buffer.from("testing this string")

let client = new net.Socket()
client.connect(8787, "127.0.0.1", () => {
	console.log("Connected")
	client.write(utfDat) //This will send the byte buffer over TCP
})
client.on('data', (data) => {
	console.log(`data: ${data}`)
})