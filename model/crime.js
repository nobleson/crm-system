            const mongoose = require('mongoose')
            const validator = require('validator')

            const crimeSchema = mongoose.Schema({
                photo: {
                    type: String,
                },
                surname: {
                    type: String,
                },
                middleName: {
                    type: String,
                },
               otherName: {
                   type: String,
                },
                 nin: {
                    type: String,
                },
                age: {
                    type: String,
                },
                gender: {
                   type: String,
               },
              nationality: {
                   type: String,
               },
               state: {
                type: String,
            },
               
                homeTown: {
                    type: String,
                },
                homeAddress: {
                   type: String,
               },
               placeofOccurrence: {
                   type: String,
                },
                 locationCoordinates: {
                    type: String,
                },
                dateOccurred: {
                    type: String,
                },
                time: {
                   type: String,
               },
               stateofOccurrence: {
                   type: String,
                },

               typeofCrime: {
                    type: String,
                },
                rname: {
                    type: String,
                },
                rnin: {
                   type: String,
               },
               idNumber: { 
                   type: String,
                   unique: true,
               },
            affiliate: {
                   type: String,
                },

 
                 dateCreated:{
                     type: Date,
                     default: Date.now 
                 },
            })


            crimeSchema.set('toJSON', { virtuals: true });


            const Crime = mongoose.model('crimes', crimeSchema)

            module.exports = Crime