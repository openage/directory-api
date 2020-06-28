exports.toModel = (items, context) => {
    if (!items || !items.length) {
        return []
    }

    return items.map(t => {
        return {
            trigger: {
                entity: t.trigger.entity,
                action: t.trigger.action,
                when: t.trigger.when || 'after'
            },
            actions: t.actions.map(a => {
                return {
                    code: a.code.toLowerCase(),
                    name: a.name,
                    handler: a.handler || 'backend',
                    type: a.type || 'http',
                    config: a.config || {}
                }
            })
        }
    })
}
