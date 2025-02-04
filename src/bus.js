export default {
    watchers: {},

    events: {},

    on(name, callback, once = false) {
        if (! this.events[name]) {
            this.events[name] = []
        }

        this.events[name].push({ callback, once })

        return () => this.off(name, callback)
    },

    once(name, callback) {
        this.on(name, callback, true)
    },

    off(name, callback) {
        this.events[name] = this.events[name].filter(registerCallback => {
            return registerCallback.callback !== callback && registerCallback.once !== true
        })
    },

    emit(name, data = {}) {
        (this.events[name] || []).forEach(callback => {
            callback.callback(data)

            if (callback.once) {
                this.off(name, callback)
            }
        })

        window.dispatchEvent(new CustomEvent(`spruce:${name}`, {
            detail: data,
            bubbles: true
        }))
    },

    watch(dotNotation, callback) {
        if (! this.watchers[dotNotation]) {
            this.watchers[dotNotation] = []
        }

        this.watchers[dotNotation].push(callback)
    },

    runWatchers(stores, target, key, value) {
        const self = this

        if (self.watchers[key]) {
            return self.watchers[key].forEach(callback => callback(value))
        }

        Object.keys(self.watchers)
            .filter(watcher => watcher.includes('.'))
            .forEach(fullDotNotationKey => {
                let dotNotationParts = fullDotNotationKey.split('.')

                if (key !== dotNotationParts[dotNotationParts.length - 1]) return

                dotNotationParts.reduce((comparison, part) => {
                    if (comparison[key] === target[key] || Object.is(target, comparison)) {
                        self.watchers[fullDotNotationKey].forEach(callback => callback(value))
                    }

                    return comparison[part]
                }, stores)
            })
    }
}