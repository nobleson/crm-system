const Crime = require('../model/crime');
  
module.exports = {
    getAll,
    getById,
    create,
    update,
    delete: _delete 
};
 
async function getAll() {
    return await Crime.find();
}

async function getById(id) {
    return await Crime.findById(id);
 
}

async function create (crimeParam) {
 console.log('Crime', crimeParam)
      const crime = new Crime(crimeParam)
      if (! crime) {
        throw Error('Account fail to create')
      }
   return await crime.save()

}
 
async function update(id, crimeParam) {
    const crime = await Crime.findById(id);

    if (!crime) throw 'Crime not found';

     Object.assign(crime, crimeParam); 
    return await crime.save();
 

}

async function _delete(id) {
    await Crime.findOneAndDelete(id);
} 