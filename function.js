function computeColor(aqi) {

    // computeColor(i)，i为0~1，输出colorA、colorB之间的数
    var color1=d3.rgb(106,206,6);
    var color2=d3.rgb(251,208,41);
    var color3=d3.rgb(254,136,0);
    var color4=d3.rgb(254,0,0);
    var color5=d3.rgb(151,4,84);
    var color6=d3.rgb(98,0,30);
    var computeColor = d3.interpolate(color1, color2);
    var compute = d3.scale.linear()
        .domain([0, 500])
        .range([0, 1]);
    //console.log( Math.floor(aqi/50));
    switch( Math.floor((aqi+25)/50)){

        case 0:
            computeColor = d3.interpolate(color1, color1);
            compute = d3.scale.linear()
                .domain([0, 25])
                .range([0, 1]);
            break;
        case 1:
             computeColor = d3.interpolate(color1, color2);
            compute = d3.scale.linear()
                .domain([25, 75])
                .range([0, 1]);
            break;
        case 2:
             computeColor = d3.interpolate(color2, color3);
            compute = d3.scale.linear()
                .domain([75, 125])
                .range([0, 1]);
            break;
        case 3:
             computeColor = d3.interpolate(color3, color4);
            compute = d3.scale.linear()
                .domain([125, 175])
                .range([0, 1]);
            break;
        case 4:
            computeColor = d3.interpolate(color4, color5);
            compute = d3.scale.linear()
                .domain([175, 275])
                .range([0, 1]);
            break;
        case 5:
            computeColor = d3.interpolate(color4, color5);
            compute = d3.scale.linear()
                .domain([175, 275])
                .range([0, 1]);
            break;
        case 6:
            computeColor = d3.interpolate(color5, color6);
            compute = d3.scale.linear()
                .domain([275, 500])
                .range([0, 1]);
            break;

        default :
            computeColor = d3.interpolate(color5, color6);
            compute = d3.scale.linear()
                .domain([275, 500])
                .range([0, 1]);
            break;


    }
    return computeColor(compute(aqi))

}

function reflash() {
    d3.selectAll("h1").html("各省空气质量总览")
    svg.selectAll("path").remove();
    queue()
        .defer(d3.json, "china.json")
        .defer(d3.json,"data/china.json")
        .await(ready);
    mapstyle=0;
    function ready(error, contrypath,airquality) {

        //console.log("ready");
        var country = svg.selectAll("path")
            .data(contrypath.features)        // 对每一个数据绑定一个path
            .enter()
            .append("path").attr("class","state")        // 对每一个数据绑定一个path
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", path)
            .attr("fill", function (d, i) {
                var name=d["properties"]["shortname"];
                if(name in airquality[format(date1)]){
                var aqi=datascale(airquality[format(date1)][name][QUALITY],QUALITY);
                // console.log(name);
                // console.log(airquality[format(date1)]);

                return computeColor(aqi);}
                else
                    return "white"
            })
            .on("click", function (d, i) {
                // console.log("mouseover", i);
                d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                svg.selectAll("path").remove();
                centerpoint=d.properties["cp"];
                mapsize=d.properties["size"];
                cityidp=d.properties["id"];
                citynamep=d.properties["shortname"];
                mapstyle=1;
                showMap(d.properties["cp"], d.properties["size"], d.properties["id"],d.properties["shortname"])

            });
            draw(airquality,tooltipHtml)
    }

}
function showMap(cp = [107, 31], size = 600, cityid = 11,cityname) {
    d3.selectAll("h1").html(cityname+"空气质量热力图")
    // 定义地图的投影
    var projection = d3.geo.mercator()
        .center(cp)
        .scale(size * 2.2)
        .translate([width / 2, height / 2]);

    // 定义地理路径生成器
    var path = d3.geo.path()
        .projection(projection);
    queue()
        .defer(d3.json,"geometryProvince\\" + cityid + ".json")
        .defer(d3.json,"data\\"+cityname+".json")
        .await(ready);
    function ready(error,province,provinceaqi){
        // console.log(provinceaqi);
        var country = svg.selectAll("path")
            .data(province.features)        // 对每一个数据绑定一个path
            .enter()
            .append("path").attr("class","state")          // 对每一个数据绑定一个path
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", path)
            .attr("fill", function (d, i) {
                var name=d["properties"]["name"].substr(0,2);
                var cities=provinceaqi[format(date1)];
                for(var key in cities){
                    //console.log(key);
                    if( key.substr(0,2)==name){

                        //console.log(key+"找到，数据为："+provinceaqi[format(date1)][key]);
                        var aqi=datascale(provinceaqi[format(date1)][key][QUALITY],QUALITY);
                        return computeColor(aqi);

                    }
                }

                return "white"
            });
            draw(provinceaqi,tooltipHtml)

    }

}
function datascale(aqi,target){
    if (target=="co"){
            scaler=d3.scale.linear().domain([0,20]).range([0,500]);
    }
    else if(target=="no2"){
            scaler=d3.scale.linear().domain([0,170]).range([0,500]);}
    else if(target=="ozone1hour"){
            scaler=d3.scale.linear().domain([0,250]).range([0,500]);}
    else if(target=="pm10"){
            scaler=d3.scale.linear().domain([0,1100]).range([0,500]);}
    else if(target=="so2"){
            scaler=d3.scale.linear().domain([0,270]).range([0,500]);}
    else{
            scaler=d3.scale.linear().domain([0,500]).range([0,500]);}
    return scaler(aqi)}
    function addDefs(kind) {
        svg.selectAll("defs").remove()
        var defs = svg.append("defs");

        var linearGradient = defs.append("linearGradient")
            .attr("id", "linearColor")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        var stop1 = linearGradient.append("stop")
            .attr("offset", "0%")
            .style("stop-color", color1);

        var stop2 = linearGradient.append("stop")
            .attr("offset", "5%")
            .style("stop-color", color1);
        var stop3 = linearGradient.append("stop")
            .attr("offset", "15%")
            .style("stop-color", color2);
        var stop4 = linearGradient.append("stop")
            .attr("offset", "25%")
            .style("stop-color", color3);
        var stop5 = linearGradient.append("stop")
            .attr("offset", "35%")
            .style("stop-color", color4);
        var stop6 = linearGradient.append("stop")
            .attr("offset", "55%")
            .style("stop-color", color5);
        var stop7 = linearGradient.append("stop")
            .attr("offset", "100%")
            .style("stop-color", color6);

        //添加一个矩形，并应用线性渐变
        svg.selectAll("#myrect").remove()
        var colorRect = svg.append("rect")
            .attr("id","myrect")
            .attr("x", 20)
            .attr("y", height-20)
            .attr("width", 300)
            .attr("height", 20)
            .style("fill", "url(#" + linearGradient.attr("id") + ")");

        //添加文字
        svg.selectAll(".valueText").remove()
        var ValueText0= svg.append("text")
            .attr("class", "valueText")
            .attr("x", 20)
            .attr("y", height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                return "0";
            });
        var ValueText1 = svg.append("text")
            .attr("class", "valueText")
            .attr("x", 35)
            .attr("y",height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "25"}
                else if(kind=="pm25"){return "25"}
                else if(kind=="pm10"){return "55"}
                else if(kind=="co"){return "1"}
                else if(kind=="so2"){return "14"}
                else if(kind=="no2"){return "9"}
                else {return "13"}
            });
        var ValueText2= svg.append("text")
            .attr("class", "valueText")
            .attr("x", 65)
            .attr("y", height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "75"}
                else if(kind=="pm25"){return "75"}
                else if(kind=="pm10"){return "165"}
                else if(kind=="co"){return "3"}
                else if(kind=="so2"){return "41"}
                else if(kind=="no2"){return "26"}
                else {return "38"}
            });
        var ValueText3 = svg.append("text")
            .attr("class", "valueText")
            .attr("x", 95)
            .attr("y",height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "125"}
                else if(kind=="pm25"){return "125"}
                else if(kind=="pm10"){return "275"}
                else if(kind=="co"){return "5"}
                else if(kind=="so2"){return "68"}
                else if(kind=="no2"){return "43"}
                else {return "63"}
            });
        var ValueText4= svg.append("text")
            .attr("class", "valueText")
            .attr("x", 125)
            .attr("y", height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "175"}
                else if(kind=="pm25"){return "175"}
                else if(kind=="pm10"){return "385"}
                else if(kind=="co"){return "7"}
                else if(kind=="so2"){return "95"}
                else if(kind=="no2"){return "60"}
                else {return "88"}
            });
        var ValueText5 = svg.append("text")
            .attr("class", "valueText")
            .attr("x", 185)
            .attr("y",height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "275"}
                else if(kind=="pm25"){return "275"}
                else if(kind=="pm10"){return "605"}
                else if(kind=="co"){return "11"}
                else if(kind=="so2"){return "149"}
                else if(kind=="no2"){return "94"}
                else {return "138"}
            });
        var ValueText6 = svg.append("text")
            .attr("class", "valueText")
            .attr("x", 320)
            .attr("y",height-20)
            .attr("dy", "-0.3em")
            .text(function () {
                if(kind=="aqi"){
                return "500"}
                else if(kind=="pm25"){return "500"}
                else if(kind=="pm10"){return "1100"}
                else if(kind=="co"){return "20"}
                else if(kind=="so2"){return "270"}
                else if(kind=="no2"){return "170"}
                else {return "250"}
            });

    }
function draw(data, toolTip){
		function mouseOver(d){
            d3.select("#tooltip").transition().duration(200).style("opacity", .9);
            if (mapstyle==0){
                var namelocal=d["properties"]["shortname"];
                console.log(namelocal)
                var datalocal=null;
                if(namelocal in data[format(date1)]){
                    datalocal=data[format(date1)][namelocal][QUALITY]
                }
            }
            else{
                var namelocal2=d["properties"]["name"].substr(0,2);
                var namelocal=d["properties"]["name"];
                var cityslocal=data[format(date1)];
                var datalocal=null;
                for(key in cityslocal){
                    console.log(key)
                    if(key.substr(0,2)==namelocal2){
                        datalocal=data[format(date1)][key][QUALITY]
                    }                   
                }
            }
            
			d3.select("#tooltip").html(toolTip(namelocal,QUALITY,datalocal))
				.style("left", (d3.event.pageX) + "px")
				.style("top", (d3.event.pageY - 28) + "px");
		}

		function mouseOut(){
			d3.select("#tooltip").transition().duration(500).style("opacity", 0);
		}

		

		d3.select("#map").selectAll("path")
			.on("mouseover", mouseOver).on("mouseout", mouseOut);
	}