import { createLibp2p } from 'libp2p';
import { tcp } from '@libp2p/tcp';
import { yamux } from '@chainsafe/libp2p-yamux'
import { noise } from '@chainsafe/libp2p-noise'
import { bootstrap } from '@libp2p/bootstrap'

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
                    '/ip4/141.95.110.56/tcp/19001/p2p/12D3KooWKSo7o3WfVuUg869qCYgwsumaiZYiAHx9dnPPF2WRuNfp',
                    '/ip4/152.228.228.16/tcp/19001/p2p/12D3KooWQkhWPSKfSAHq25MPy4RWuKoY7fvJn8J5rAV7bo5q59DX',
                    // '/dnsaddr/nextnet.sha-p2pool.tari.com'
                ]
            })
        ]
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

        node
            .dialProtocol(evt.detail.multiaddrs, '/tari_direct_peer_info/5')
            .catch((err) => console.error('Failed to dial:', err))
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
    process.stdin.resume()
}

main().catch(console.error)