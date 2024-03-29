const fs = require('fs');
const path = require('path');
const { EventEmitter } = require('events');
const subbedChannels = require('./subbedChannels.json');

class WildernessFlashEvents extends EventEmitter {
    static events = [
        { name: "Spider Swarm", order: 1, special: false },
        { name: "Unnatural Outcrop", order: 2, special: false },
        { name: "Demon Stragglers", order: 3, special: false },
        { name: "Butterfly Swarm", order: 4, special: false },
        { name: "King Black Dragon Rampage", order: 5, special: true },
        { name: "Forgotten Soldiers", order: 6, special: false },
        { name: "Surprising Seedlings", order: 7, special: false },
        { name: "Hellhound Pack", order: 8, special: false },
        { name: "Infernal Star", order: 9, special: true },
        { name: "Lost Souls", order: 10, special: false },
        { name: "Ramokee Incursion", order: 11, special: false },
        { name: "Displaced Energy", order: 12, special: false },
        { name: "Evil Bloodwood Tree", order: 13, special: true },
    ];
    reminderInterval;

    constructor(reminderInterval) {
        super();

        this.reminderInterval = (reminderInterval) ? reminderInterval : 5;

        setTimeout(this.handleUpcomingEvent.bind(this), this.getNextReminderTime());
    }


    handleUpcomingEvent() {
        this.emit('eventSoon', this.constructor.getNextEvent());
        setTimeout(this.handleUpcomingEvent.bind(this), 3600000);
    }

    static getNextEvent() {
        let nextEvent = this.prototype._getNextEvent();
        return nextEvent;
    }

    _getNextEvent() {

        let baseline = 1670742000000; // Dec 11 2022, 2:00 AM
        let currentEventIdx = 2;
        // let baselineEvent = events[3]; // Butterfly Swarm
        // let hoursElapsed = 0;

        let now = new Date();
        let nowMs = now.getTime() + 3600000;

        while (baseline < nowMs) {
            baseline += 3600000; // Add one hour to baseline
            currentEventIdx = (currentEventIdx == 12) ? 0 : currentEventIdx + 1;
        }
        return this.constructor.events[currentEventIdx];
    }

    getNextReminderTime() {
        let now = new Date();
        let nextRemind = new Date(now.getTime());
        nextRemind.setMinutes(60 - this.reminderInterval);
        nextRemind.setSeconds(0);
        nextRemind.setMilliseconds(0);

        return (nextRemind.getTime() - now.getTime());
    }

    static getSubbedChannels() {
        return subbedChannels;
    }

    static saveChannels() {
        fs.writeFileSync(path.join(__dirname, "/subbedChannels.json"), JSON.stringify(subbedChannels, null, 4));
    }

    static addToSubbedChannels(channel) {
        if (subbedChannels[channel.id]) {
            return 409;
        }

        subbedChannels[channel.id] = {
            name: channel.name,
            specialsOnly: channel.specialsOnly
        }

        this.saveChannels();
        console.log(`(Wildy) - Added ${channel.id} to the list.`);
        return 201;
    }

    static deleteSubbedChannel(channel) {
        if (!subbedChannels[channel.id]) {
            return 204;
        }

        delete subbedChannels[channel.id];

        this.saveChannels();
        console.log(`(Wildy) - Deleted ${channel.id} from the list.`);
        return 202;
    }

    static timeToNextHour() {
        let now = new Date();
        let later = new Date(now);
        later.setHours(now.getHours() + 1);
        later.setMinutes(0);
        later.setSeconds(0);
        later.setMilliseconds(0);

        return Number((later.getTime() - now.getTime()) / 1000 / 60).toFixed(0);
    }

}


module.exports = { WildernessFlashEvents, subbedChannels };