
    fetch('../assets/data/gp.json')
        .then((response) => response.json())
        .then(async (json) => {            

            let filterShowedParam = {
                origin: [],
                launchDate : "all",
                rcsSize : [],
                orbit: []
            }
            let otherOriginTab = ["ARGN","FR","CA","CHBZ","ESA","EUME","GER","BLOB","IND","ISRA","ISS","IT","ITSO","JPN","NKOR","ORB","PRC","SEAL","TBD","UK","UnknowOrigin"]
            let allLaunchDateTab = ["2020","2010","2000","1990","1980","1970","1960","1950","UnknowLauncheDate"]
            const EQUATOR = 0
            const LOWORBIT = 2000 //km
            const MEDIUMORBIT = 35786 //km
            const GEOSYNCHRONOUSORBIT = 42000 //km

            // Initialize the Cesium viewer.
            const viewer = new Cesium.Viewer('cesiumContainer', {
                imageryProvider: new Cesium.SingleTileImageryProvider({
                    url: "../assets/textures/earth.jpg",
                }),
                contextOptions : {
                    webgl: {
                        alpha: true
                    }
                },
                baseLayerPicker: false, geocoder: false, homeButton: false, infoBox: false,
                navigationHelpButton: false, sceneModePicker: false
            })

            viewer.scene.skyBox.destroy();
            viewer.scene.skyBox = undefined;
            viewer.scene.sun.destroy();
            viewer.scene.sun = undefined;
            viewer.scene.moon.destroy();
            viewer.scene.moon = undefined;
            viewer.scene.skyAtmosphere.destroy();
            viewer.scene.skyAtmosphere = undefined;
            viewer.scene.backgroundColor = new Cesium.Color(0, 0, 0, 0);
            viewer.fullscreenButton.destroy()
            addOrbit(LOWORBIT)
            addOrbit(MEDIUMORBIT)
            addOrbit(GEOSYNCHRONOUSORBIT)
                       

            let initialized = false;
            viewer.scene.globe.tileLoadProgressEvent.addEventListener(() => {
            if (!initialized && viewer.scene.globe.tilesLoaded === true) {
                viewer.clock.shouldAnimate = true;
                initialized = true;
                viewer.scene.camera.zoomOut(7000000);
                document.querySelector("#loading").classList.toggle('disappear', true)                
            }
            });        


            //display debris
            for(item of json){           

                const DEB_TLE = 
                `${item.TLE_LINE1}
                ${item.TLE_LINE2}`

                const satrec = satellite.twoline2satrec(
                    DEB_TLE.split('\n')[0].trim(), 
                    DEB_TLE.split('\n')[1].trim()
                );
                
                let d = new Date()
                const positionAndVelocity = satellite.propagate(satrec, d);
                if(positionAndVelocity[0] !== false){
                    const gmst = satellite.gstime(new Date());
                    const position = satellite.eciToGeodetic(positionAndVelocity.position, gmst);

                    let filterOrigin = otherOriginTab.includes(item.COUNTRY_CODE ?? "UnknowOrigin") ? "OTHERORIGIN" : item.COUNTRY_CODE
                    let decadeDate
                    let orbit
                    if(item.LAUNCH_DATE){
                        let splicedDate = item.LAUNCH_DATE.split('')
                        decadeDate = `${splicedDate[0]}${splicedDate[1]}${splicedDate[2]}0`
                    }else{
                        decadeDate = "UnknowLauncheDate"
                    }

                    if(position.height < LOWORBIT){
                        orbit = "LOWORBIT"
                    }else if(position.height < MEDIUMORBIT){
                        orbit = "MEDIUMORBIT"
                    }else{
                        orbit = "HIGHORBIT"
                    }
                    
                    const satellitePoint = viewer.entities.add({
                        name:item.OBJECT_NAME ?? "Unknow",
                        objectId:item.OBJECT_ID ?? "Unknow",
                        origin:item.COUNTRY_CODE ?? "Unknow",
                        launchDate: item.LAUNCH_DATE ?? "Unknow",
                        size: item.RCS_SIZE ?? "Unknow",
                        height: orbit,
                        allParams: [filterOrigin,decadeDate, item.RCS_SIZE ?? "UNKNOWSIZE",orbit],
                        position: Cesium.Cartesian3.fromRadians(
                            position.longitude, position.latitude, position.height * 1000
                            ),
                        point: { pixelSize: 2, color: Cesium.Color.RED }
                    });
                }
            }

            // event for selected point
            viewer.selectedEntityChanged.addEventListener(function(selectedEntity) {
                if (!Cesium.defined(selectedEntity)) {
                    viewer.scene.camera.flyHome(2)
                    viewer.trackedEntity = viewer.globe ;
                }
            })

            //filters
            for(let button of document.querySelectorAll(".inputBtn")){
                button.addEventListener("click", async (event) => {
                    if(button.checked){
                        document.getElementById(button.name).classList.toggle('activeBtn', true)
                        if(button.classList.contains("origin")){
                            filterShowedParam.origin.push(button.name)
                        }else if(button.classList.contains("rcsSize")){
                            filterShowedParam.rcsSize.push(button.name)
                        }else if(button.classList.contains("orbit")){
                            filterShowedParam.orbit.push(button.name)
                        }

                        await updateEntities()
                    }else{
                        if(button.classList.contains("origin")){
                            filterShowedParam.origin.splice(filterShowedParam.origin.indexOf(button.name),1)
                        }else if(button.classList.contains("rcsSize")){
                            filterShowedParam.rcsSize.splice(filterShowedParam.rcsSize.indexOf(button.name),1)
                        }else if(button.classList.contains("orbit")){
                            filterShowedParam.orbit.splice(filterShowedParam.orbit.indexOf(button.name),1)
                        }
                        document.getElementById(button.name).classList.toggle('activeBtn', false)
                        await updateEntities()
                    }
                })
            }

            for(let select of document.querySelectorAll(".selectInput")){
                select.addEventListener("change", async (event) => {
                    filterShowedParam.launchDate = select.value
                    await updateEntities()
                })
            }

            document.getElementById("showOrbit").addEventListener("click", () =>{
                for(let entity of viewer.entities.values){
                    if(entity.name == "ORBIT"){
                        entity.show = !entity.show
                        document.getElementById("showOrbitLabel").classList.toggle('activeBtn')
                    }
                }
            })

            document.getElementById("resetView").addEventListener("click", () =>{
                viewer.scene.camera.flyHome(2)
                viewer.trackedEntity = viewer.globe ;
            })            

            //add space cleaner model and move it
            // document.getElementById("spaceCleanSat").addEventListener("click", () => {
            //     const ISS_TLE = 
            //     `1 25544U 98067A   21121.52590485  .00001448  00000-0  34473-4 0  9997
            //     2 25544  51.6435 213.5204 0002719 305.2287 173.7124 15.48967392281368`;

            //     const satrec = satellite.twoline2satrec(
            //         ISS_TLE.split('\n')[0].trim(), 
            //         ISS_TLE.split('\n')[1].trim()
            //     );

            //     const totalSeconds = 60 * 60 * 6;
            //     const timestepInSeconds = 10;
            //     const start = Cesium.JulianDate.fromDate(new Date());
            //     const stop = Cesium.JulianDate.addSeconds(start, totalSeconds, new Cesium.JulianDate());
            //     viewer.clock.startTime = start.clone();
            //     viewer.clock.stopTime = stop.clone();
            //     viewer.clock.currentTime = start.clone();
            //     viewer.timeline.zoomTo(start, stop);
            //     // viewer.clock.multiplier = 1;
            //     viewer.clock.clockRange = Cesium.ClockRange.LOOP_STOP;
                
            //     const positionsOverTime = new Cesium.SampledPositionProperty();
            //     for (let i = 0; i < totalSeconds; i+= timestepInSeconds) {
            //         const time = Cesium.JulianDate.addSeconds(start, i, new Cesium.JulianDate());
            //         const jsDate = Cesium.JulianDate.toDate(time);

            //         const positionAndVelocity = satellite.propagate(satrec, jsDate);
            //         const gmst = satellite.gstime(jsDate);
            //         const p   = satellite.eciToGeodetic(positionAndVelocity.position, gmst);
            //         p.height+=1000

            //         const position = Cesium.Cartesian3.fromRadians(p.longitude, p.latitude, p.height * 1000);
            //         positionsOverTime.addSample(time, position);
            //     }
            //     let url = '../assets/models/low_poly_satellite.glb'

            //     const satellitePoint = viewer.entities.add({
            //         position: positionsOverTime,
            //         name: "SpaceCleaner",
            //         model: {
            //             uri: url,
            //             minimumPixelSize: 128,
            //             maximumScale: 20000,
            //           }
            //     });

            //     viewer.trackedEntity = satellitePoint;
            // })

            //update scene
            const updateEntities = async () => {

                for(entity of viewer.entities.values){
                    if(entity.name !== "SpaceCleaner" && entity.name !== "ORBIT"){

                        if(filterShowedParam.origin.length === 0 && filterShowedParam.launchDate === "all" && filterShowedParam.rcsSize.length === 0 && filterShowedParam.orbit.length === 0){
                            entity.show = true
                        }else{

                            let originBool = true
                            let launchDateBool = true
                            let rcsSizeBool = true
                            let orbitBool = true
 
                            if(filterShowedParam.origin.length > 0){
                                originBool = filterShowedParam.origin.some((origin) => entity.allParams.includes(origin))
                            }
        
                            if(filterShowedParam.launchDate !== "all"){
                                launchDateBool = entity.allParams.includes(filterShowedParam.launchDate)
                            }

                            // console.log(entity.allParams)
                            if(filterShowedParam.rcsSize.length > 0){
                                rcsSizeBool = filterShowedParam.rcsSize.some((origin) => entity.allParams.includes(origin))
                            }

                            if(filterShowedParam.orbit.length > 0){
                                orbitBool = filterShowedParam.orbit.some((origin) => entity.allParams.includes(origin))
                            }

                            entity.show = originBool && launchDateBool && rcsSizeBool && orbitBool


                        }
                        
                    }
                }
            }

            function addOrbit(height){
                viewer.entities.add({
                    name: "ORBIT",
                    polyline: {
                      positions: Cesium.Cartesian3.fromDegreesArrayHeights([
                        -180,
                        EQUATOR,
                        height*1000,
                        -90,
                        EQUATOR,
                        height*1000,
                        0,
                        EQUATOR,
                        height*1000,
                        90,
                        EQUATOR,
                        height*1000,
                        180,
                        EQUATOR,
                        height*1000,
                      ]),
                      width: 1,
                      arcType: Cesium.ArcType.RHUMB,
                      material: Cesium.Color.GHOSTWHITE,
                    },
                });
            }

            
        });
