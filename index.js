import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { bootstrap } from '@libp2p/bootstrap'
import cbor from 'cbor';

async function main() {
    const node = await createLibp2p({
        addresses: {
            listen: [
                '/ip4/0.0.0.0/tcp/0',
                '/ip6/::/tcp/0'
            ]
        },
        transports: [tcp()],
        streamMuxers: [yamux()],
        connectionEncrypters: [noise()],
        peerDiscovery: [
            bootstrap({
                list: [
                    // '/ip4/141.95.110.56/tcp/19001/p2p/12D3KooWKSo7o3WfVuUg869qCYgwsumaiZYiAHx9dnPPF2WRuNfp',
                    // '/ip4/152.228.228.16/tcp/19001/p2p/12D3KooWQkhWPSKfSAHq25MPy4RWuKoY7fvJn8J5rAV7bo5q59DX',
                    // '/ip4/51.79.100.32/tcp/19001/p2p/12D3KooWQnnwLkEx7uuENdXiaNUeghcUZoJ27QvW1fZHYeRUCtUR',
                    // '/ip4/152.228.210.16/tcp/19001/p2p/12D3KooWD6GY3c8cz6AwKaDaqmqGCbmewhjKT5ULN9JUB5oUgWjS',
                    '/ip4/51.83.255.30/tcp/19001/p2p/12D3KooWSbJLEQwkfYnohxahhQC4N69yvH7k5jyiijtny4htMZKF'
                    // '/dnsaddr/nextnet.sha-p2pool.tari.com'
                ]
            })
        ]
        // protocols: [
        //     requestResponse({
        //         protocol: '/catch_up_sync/5',
        //         handlers: {
        //             onRequest: async ({ connection, stream, request }) => {
        //                 console.log('Received request:', request.toString());
        //                 const response = Buffer.from('Hello, this is the response!');
        //                 return response;
        //             },
        //             onResponse: async ({ connection, stream, response }) => {
        //                 console.log('Received response:', response.toString());
        //             }
        //         }
        //     })
        // ]
    })

    // Start the node
    await node.start()

    // Log the node's addresses
    console.log('Node started with addresses:')
    node.getMultiaddrs().forEach((addr) => {
        console.log(addr.toString())
    })

    // Listen for new peers
    node.addEventListener('peer:discovery', async (evt) => {
        console.log('Discovered:', evt.detail.id.toString(), evt.detail)

        // node
        //     .dialProtocol(evt.detail.multiaddrs, '/tari_direct_peer_info/5')
        //     .catch((err) => console.error('Failed to dial:', err))

        const { stream } = await node.dialProtocol(evt.detail.multiaddrs, '/tari_direct_peer_info/5').catch((err) => console.error('Failed to dial for direct peer:', err));
        // const { stream, protocol } = await node.dialProtocol(evt.detail.multiaddrs, '/catch_up_sync/5').catch((err) => console.error('Failed to dial for catchup:', err));

        // // console.log(stream);
        // console.log(protocol);
        // // JavaScript equivalent of the Rust struct
        // const catchUpSyncRequest = {
        //     algo: 1, // Replace with your actual `algo` value
        //     i_have: [
        //     ],
        //     last_block_received: null
        // };

        // // Encode to CBOR
        // const encodedData = cbor.encode(catchUpSyncRequest);
        // const writer = stream.sink;
        // writer.push(encodedData);
        // writer.end();

        // // Read the response from the stream
        // const responseChunks = [];
        // for await (const chunk of stream.source) {
        //     responseChunks.push(chunk);
        // }

        // // Decode the response with CBOR
        // const decodedResponse = cbor.decode(Uint8Array.from(responseChunks));
        // console.log('Response received:', decodedResponse);
    })

    // Listen for new connections
    node.addEventListener('peer:connect', (evt) => {
        console.log('Connected to:', evt.detail.toString())

        // Get and display peer info
        getPeerInfo(node, evt.detail)
    })


    // Function to get peer information
    async function getPeerInfo(node, peerId) {
        try {
            const peer = await node.peerStore.get(peerId)
            console.log('Peer Information:', peer)
            console.log('ID:', peer.id.toString())
            console.log('Protocols:', await node.peerStore.protocols?.get(peerId))
            console.log('Addresses:', peer.addresses.map(addr => addr.multiaddr.toString()))

            // Get connected peers list
            const peers = await node.peerStore.all()
            console.log('\nConnected Peers List:')
            peers.forEach(peer => {
                console.log(`- ${peer.id.toString()}`)
            })
        } catch (err) {
            console.error('Error getting peer info:', err)
        }
    }

    // const peerId = '12D3KooWKSo7o3WfVuUg869qCYgwsumaiZYiAHx9dnPPF2WRuNfp'; // Replace with actual peer ID
    // const { stream } = await node.dialProtocol(peerId, '/catch_up_sync/5');

    // const request = Buffer.from('Hello, this is the request!');
    // const response = await node.handleRequest({ stream, request });
    // console.log('Response:', response.toString());

    process.stdin.resume()
}

main().catch(console.error)