/*
 * Library for storing and editing data
 *
 */

// Dependencies
const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

const util = require('util')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const open = util.promisify(fs.open)
const close = util.promisify(fs.close)
const truncate =  util.promisify(fs.ftruncate)

// Container for module (to be exported)
const lib = {}

// Base directory of data folder
lib.baseDir = path.join(__dirname,'/../data/')

// Write data to a file
lib.create = async(dir,fileName,data)=>{
  // Open the file for writing  
  try{
    const fileDescriptor = await open(lib.baseDir+dir+'/'+fileName+'.json', 'wx')
    /////////////////////
    //'w' - Open file for writing. The file is created (if it does not exist) 
        //or truncated (if it exists).
        //'wx' - Like 'w' but fails if the path exists.
        //'w+' - Open file for reading and writing. The file is created (if it does not exist)
        //or truncated (if it exists).
        //'wx+' - Like 'w+' but fails if the path exists.
    //open the file we want to create
    //wx:open the file for writing
    //fileDescriptor: part of callback returned, is a unique identifier
      // Convert data to string
    const stringData = JSON.stringify(data)
    // Write to file and close it
    await writeFile(fileDescriptor,stringData)
    //closing fs connection
    await close(fileDescriptor)
    return "all done"
    /////////////////////
  }catch(e){
    return e.message//callback('Could not create new file, it may already exist')
  }
}
//fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8'
// Read data from a file
lib.read = async(dir,file)=>{ 
  try{
    const data = await readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8')
    return helpers.parseJsonToObject(data)
  }catch(e){
    return false
  }
}

lib.readPlainData = async(dir,file)=>{ 
  try{
    const data = await readFile(lib.baseDir+dir+'/'+file, 'utf8')
    return data//helpers.parseJsonToObject(data)
  }catch(e){
    return false
  }
}
// Update data in a file
lib.update = async(dir,file,data)=>{
  // Open the file for writing
  try{
    const fileDescriptor=await open(lib.baseDir+dir+'/'+file+'.json', 'r+')
    // Convert data to string
    const stringData = JSON.stringify(data)

    // Truncate the file
    await truncate(fileDescriptor)
    await writeFile(fileDescriptor, stringData)
    console.log(p)
    await close(fileDescriptor)
    return fileDescriptor
  }catch(e){
    return false
  }
}

// Delete a file
lib.delete = (dir,file,callback)=>{

  // Unlink the file from the filesystem
  fs.unlink(lib.baseDir+dir+'/'+file+'.json', err=>{
    callback(err)
  })

}

// List all the items in a directory
lib.list = (dir,callback)=>{
  fs.readdir(lib.baseDir+dir+'/', (err,data)=>{
    if(!err && data && data.length > 0){
      const trimmedFileNames = []
      data.forEach(fileName=>{
        trimmedFileNames.push(fileName.replace('.json',''))
      })
      callback(false,trimmedFileNames)
    } else {
      callback(err,data)
    }
  })
}

// Export the module
module.exports = lib
