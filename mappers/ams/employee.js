let mapper = require('../employee')

exports.toModel = (entity, context) => {
    var model = mapper.toModel(entity, context)
    model._id = model.id // to detect it is comming from open-age
    return model
}
