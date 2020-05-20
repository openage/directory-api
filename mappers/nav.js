exports.toModel = (items, context) => {
    if (!items || !items.length) {
        return []
    }

    return items.map(n => {
        return {
            code: n.code,
            name: n.name,
            url: n.url,
            icon: n.icon,
            title: n.title,
            routerLink: n.routerLink,
            permissions: n.permissions,
            items: this.toModel(n.items)
        }
    })
}
