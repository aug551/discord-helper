var Service = require('node-windows').Service;
const path = require('path');

var svc = new Service({
    name: "Discord Helper",
    description: "Airi Discord helper as a winservice",
    script: path.join(__dirname, "index.js"),
    nodeOptions: [
        '--harmony',
        '--max_old_space_size=4096'
    ]
});

svc.on('install', () => {
    svc.start();
});

svc.install();