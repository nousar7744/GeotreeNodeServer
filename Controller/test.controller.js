import fs from "fs";
import jwt from 'jsonwebtoken'

export const generateToken = (req,res) => {
    let jwtSecretKey = "Coching text";
    let data = {
        time: Date(),
        userId: 12,
    }
    const token = jwt.sign(data, jwtSecretKey);
    const verified = jwt.verify(token, jwtSecretKey);
    console.log('token',token)
    if(verified){
        return res.send("Successfully Verified");
    }else{
        // Access Denied
        return res.status(401).send(error);
    }
    // res.send(token);

}


export const AllData = (req,res) => {
    fs.readFile("user.json",(err,data) =>{
        if(err){
            var response = {
                "status":false,
                "msg":"Something wrong with request.",
                "data":err,
            }
        }else{
            var response = {
                "status":true,
                "msg":"File read successfully.",
                "data":JSON.parse(data),
            }
        }
        
        res.send(response);
    })
    // console.log("Controller is working");
    
}
export const writeFile = (req,res) => {
    fs.writeFile("data.json","Hello world",(error) => {
        if(error == null){
            var data = {
                "status":true,
                "msg":"File created successfully.",
                "data":[],
            }
        }else{
            var data = {
                "status":false,
                "msg":"Something wrong with request.",
                "data":error,
            }
        }
        res.send(data);
    })
    console.log("Controller is working");
    
}