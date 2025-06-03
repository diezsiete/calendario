let currentInterval = null;
onmessage = (e) => {
    switch (e.data.type) {
        case 'start':
            // console.log('%cWorker', 'color: #71C0BB', `start received, name: ${e.data.name} duration: ${e.data.duration}`);
            startTimer(e.data.name, e.data.duration);
            break;
        case 'stop':
            // console.log('%cWorker', 'color: #71C0BB', 'stop received');
            if (currentInterval) {
                clearInterval(currentInterval);
            }
            break;
        default:
            console.log('%cWorker', 'color: #71C0BB', `undefined action ${e.data.type}`);
    }
};

function startTimer(name, duration) {
    const startTime = Date.now() + duration * 1000;
    currentInterval = setInterval(() => {
        const now = Date.now();
        let currentTime = Math.ceil((startTime - now) / 1000);
        if (currentTime <= 0) {
            postMessage({type: 'end', name});
            clearInterval(currentInterval);
        } else {
            postMessage({type: 'second', second: currentTime})
        }
    }, 1000);
}