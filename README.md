# MERN-BLOG-2022-05-05--Server

This is the MERN BLOG for The Odin Project :BLOG API(https://www.theodinproject.com/lessons/nodejs-blog-api) 

![screenshot](https://res.cloudinary.com/dcuaa601z/image/upload/v1651733206/MERN-BLOG/screen_cazwk1.png)

## APP URL
https://mern-blog-2022-05-05.vercel.app/

## Github repo for client side
https://github.com/HIROS-DEV/MERN-BLOG-2022-05-05

## Features

- Authentication (Signup & Login with jsonwebtoken)
- Create Blog (Not only text, but also upload image with multer and cloudinary)
- Update & Delete Blog
- Pagination
- Create & Delete Comment(s)
- Subscribe newsletter with mailchimp
- Show map with mapbox
- Contact form with nodemailer

### Env Variables

I used .env & .env.production file in the client side.
And, nodemon.json file in the server side.

-Client Side(.env & .env.production)-
REACT_APP_MAPBOX_TOKEN= "your mapbox token here" <br/>
REACT_APP_BACKEND_URL= "your server side url here" <br/>

-Server Side(nodemon.json)- <br/>
{<br/>
    "env": {
        "MONGO_USERNAME": "your mongodb usename here", <br/>
        "MONGO_PASSWORD": "your mongodb password here", <br/>
        "MONGO_DATABASE": "your mongo db database name here", <br/>
        "CLOUDINARY_CLOUD_NAME": "your cloudinary cloud name here", <br/>
        "CLOUDINARY_KEY": "your cloudinary key here", <br/>
        "CLOUDINARY_SECRET": "your cloudinary secret here", <br/>
        "JWT_SECRET":"your jwt secret here", <br/>
        "MAILCHIMP_API_KEY": "your mailchimp api key here", <br/>
        "MAILCHIMP_API_SERVER": "your mailchimp api server here", <br/>
        "MAILCHIMP_LIST_ID": "your mailchimp list id here", <br/>
        "CONTACTFORM_USER": "admin email address here", <br/>
        "CONTACTFORM_PASSWORD": "admin password here" <br/>
    }
}
