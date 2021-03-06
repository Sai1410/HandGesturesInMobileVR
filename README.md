﻿# HandGesturesInMobileVR

## Description

Application written in JavaScript and Opencv.js designed for smartphones which allows to interact with Virtual Reality world using hands. It uses Opencv.js to detect hand by skin color. To simplify detection, the default alghoritm is to detect hand with black glove because of differences in lightning - with different lightning in a room hand has different skin color. For testing, the application uses framework called aframe which allows to generate 3D terrain. 

The application's alghoritm:
1. Detect hand on a phone's camera
2. Detect grabbing gesture with pointing finger and a thumb - it is detected by moving the tips close to eachother
3. Interact with Virtual Reality world
4. Move an object in Virtual Reality world

## Installation

To use an application on smartphones it needs to be placed in some kind of a server like Apache: https://tutorials.ubuntu.com/tutorial/install-and-configure-apache and in appropriate directory. It is needed because of the fact that smartphone's browsers allows camera usage only from localhost sites or with sites that use ssl. The last one needs to be set in server configuration. 
