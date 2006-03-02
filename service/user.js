const Crime = require('../model/crime');
const sesClient = require('../ses-client')
const passwordUtils = require('../util/passwordUtils')

module.exports = {
    getAll,
    getById,
    create,
    update,
    reset,
    verifyAccount,
    verifyNumber,
    delete: _delete 
};
 
async function getAll() {
    return await Crime.find();
}

async function getById(id) {
    let crime = await Crime.findById(id);


    let newCrime = {
      crimeClaims: crime.crimeClaims,
      crimeBlogPosts: crime.crimeBlogPosts,
      twoFactorAuth: crime.twoFactorAuth,
      id: crime.id,
      _id: crime._id,
      country: crime.country,
      firstName: crime.firstName,
      lastName: crime.lastName,
      phoneNumber: crime.phoneNumber,
      contactAddress: crime.contactAddress,
      crimeReviews: crime.crimeReviews,
      city: crime.city,
      email: crime.email,
      agreement: crime.agreement,
      dateCreated: crime.dateCreated,
      photo: crime.photo,
      crimeBusinessPage: crime.crimeBusinessPage,
      displayName: crime.displayName,
      businessSummary: crime.businessSummary
    }
    return newCrime
}

 async function reset(id, crimeParam ){
    let crime = await Crime.findById(id);

    const newSaltHash = passwordUtils.genPassword(crimeParam.newPwd);
    const isValid = passwordUtils.validPassword(crimeParam.oldPwd, crime.hash, crime.salt);

    if(isValid){

      crime.passwordChange = { salt: crime.salt, hash: crime.hash, createdAt: new Date() }
      crime.salt = newSaltHash.salt
      crime.hash = newSaltHash.hash
      crime.password = ''
      crime.updatedAt = new Date()
      
      Object.assign(crime, crimeParam); 
      await crime.save();
      
      let newCrime = {
        crimeClaims: crime.crimeClaims,
        crimeBlogPosts: crime.crimeBlogPosts,
        twoFactorAuth: crime.twoFactorAuth,
        id: crime.id,
        _id: crime._id,
        country: crime.country,
        firstName: crime.firstName,
        lastName: crime.lastName,
        phoneNumber: crime.phoneNumber,
        contactAddress: crime.contactAddress,
        crimeReviews: crime.crimeReviews,
        city: crime.city,
        email: crime.email,
        agreement: crime.agreement,
        dateCreated: crime.dateCreated,
        photo: crime.photo,
        crimeBusinessPage: crime.crimeBusinessPage,
        displayName: crime.displayName,
        businessSummary: crime.businessSummary
      }
      return newCrime 
    }else{
      return {error: 'password is not correct'}
    }



}

async function create (crimeParam, {salt, hash}) {
    //  const response = { status: false, data: {} }
  
      if (await Crime.findOne({ email: crimeParam.email })) {
          return { error: crimeParam.email + ' is already taken' }
      }
      if (await Crime.findOne({ phoneNumber: crimeParam.phoneNumber })) {
        return { error: crimeParam.phoneNumber + ' is already taken' }
      }
      const crime = new Crime(crimeParam)
      if (! crime) {
        throw Error('Account fail to create')
      }
      crime.displayName = crimeParam.email.substring(0, crimeParam.email.lastIndexOf("@"));
     // crime.displayName = crime.displayName.replace(/\./g,'_')
      crime.salt = salt
      crime.hash = hash
      crime.password = ''
      crime.accountId = crime._id
      crime.crimeClaims.crimeRole = crimeParam.tradeRole
      if (crime) {
         // const query = crypto.encrypt(account._id)
          sesClient.sendEmail(
              crime.email,
              'Email Activation | Openfarm | Member',
             `<h4> Hi ${crime.firstName},</h4>
             <h5>Thank you for registering as a member with Openfarm.<h/5>
             
             <h5>Please click the link below to verify your email and activate your account.</h5>
             
             <a href="https://openfarm-1233.appspot.com/member/email/verify/${crime._id}">Email Verification</a>
             <br /> 
             <h5>Openfarm Global Services Limited</h5>
             <h5><a href="#">Openfarm</a></h5>
             <a href="#">Facebook</a> <a href="#">Twitter</a>`)

         return await crime.save()

     }
  }
async function verifyAccount(email) {

    const crime = await Crime.findOne({email:email})
    if( !crime){
      return { error: 'No account exist with this email ' }
    }
    if(crime && crime.crimeClaims.isEmailVerified == false){
      return { error: 'Please check your email to activate account' }
    }
    return { succes: ' crime is verified' }
}
async function verifyNumber(crimeParam) {
  console.log('crimeParam',crimeParam)
  return crimeParam
}
async function update(id, crimeParam) {
    const crime = await Crime.findById(id);

    if (!crime) throw 'Crime not found';

    crime.updatedAt = new Date()
    Object.assign(crime, crimeParam); 
    await crime.save();

    let newCrime = {
      crimeClaims: crime.crimeClaims,
      crimeBlogPosts: crime.crimeBlogPosts,
      twoFactorAuth: crime.twoFactorAuth,
      id: crime.id,
      _id: crime._id,
      country: crime.country,
      firstName: crime.firstName,
      lastName: crime.lastName,
      phoneNumber: crime.phoneNumber,
      contactAddress: crime.contactAddress,
      crimeReviews: crime.crimeReviews,
      city: crime.city,
      email: crime.email,
      agreement: crime.agreement,
      dateCreated: crime.dateCreated,
      photo: crime.photo,
      crimeBusinessPage: crime.crimeBusinessPage,
      displayName: crime.displayName,
      businessSummary: crime.businessSummary
    }
    return newCrime

}

async function _delete(id) {
    await Crime.findOneAndDelete(id);
} 