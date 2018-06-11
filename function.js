function computeColor(aqi) {

    // computeColor(i)，i为0~1，输出colorA、colorB之间的数
    var color1 = d3.rgb(106, 206, 6);
    var color2 = d3.rgb(251, 208, 41);
    var color3 = d3.rgb(254, 136, 0);
    var color4 = d3.rgb(254, 0, 0);
    var color5 = d3.rgb(151, 4, 84);
    var color6 = d3.rgb(98, 0, 30);
    var computeColor = d3.interpolate(color1, color2);
    var compute = d3.scale.linear()
        .domain([0, 500])
        .range([0, 1]);
    //console.log( Math.floor(aqi/50));
    switch (Math.floor((aqi + 25) / 50)) {

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
    d3.selectAll("h1").html("各省空气质量总览");
    svg.selectAll("path").remove();
    queue()
        .defer(d3.json, "china.json")
        .defer(d3.json, "data/china.json")
        .await(ready);
    mapstyle = 0;

    function ready(error, contrypath, airquality) {

        //console.log("ready");
        var country = svg.selectAll("path")
            .data(contrypath.features)        // 对每一个数据绑定一个path
            .enter()
            .append("path").attr("class", "state")        // 对每一个数据绑定一个path
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", path)
            .attr("fill", function (d, i) {
                var name = d["properties"]["shortname"];
                if (name in airquality[format(date1)]) {
                    var aqi = datascale(airquality[format(date1)][name][QUALITY], QUALITY);
                    // console.log(name);
                    // console.log(airquality[format(date1)]);

                    return computeColor(aqi);
                }
                else
                    return "white"
            })
            .on("click", function (d, i) {
                // console.log("mouseover", i);
                d3.select("#tooltip").transition().duration(500).style("opacity", 0);
                svg.selectAll("path").remove();
                centerpoint = d.properties["cp"];
                mapsize = d.properties["size"];
                cityidp = d.properties["id"];
                citynamep = d.properties["shortname"];
                mapstyle = 1;
                showMap(d.properties["cp"], d.properties["size"], d.properties["id"], d.properties["shortname"])


            });
        draw(airquality, tooltipHtml)
    }

}

function showMap(cp = [107, 31], size = 600, cityid = 11, provincename) {
    d3.selectAll("h1").html(provincename + "空气质量热力图");
    // 定义地图的投影
    var projection = d3.geo.mercator()
        .center(cp)
        .scale(size * 2.2)
        .translate([width / 2, height / 2]);

    // 定义地理路径生成器
    var path = d3.geo.path()
        .projection(projection);
    queue()
        .defer(d3.json, "geometryProvince\\" + cityid + ".json")
        .defer(d3.json, "data\\" + provincename + ".json")
        .await(ready);

    function ready(error, province, provinceaqi) {
        // console.log(provinceaqi);
        var country = svg.selectAll("path")
            .data(province.features)        // 对每一个数据绑定一个path
            .enter()
            .append("path").attr("class", "state")          // 对每一个数据绑定一个path
            .attr("stroke", "#000")
            .attr("stroke-width", 1)
            .attr("d", path)
            .attr("fill", function (d, i) {
                var name = d["properties"]["name"].substr(0, 2);
                var cities = provinceaqi[format(date1)];
                for (var key in cities) {
                    //console.log(key);
                    if (key.substr(0, 2) == name) {

                        //console.log(key+"找到，数据为："+provinceaqi[format(date1)][key]);
                        var aqi = datascale(provinceaqi[format(date1)][key][QUALITY], QUALITY);
                        return computeColor(aqi);

                    }
                }

                return "white"
            }).on("click", function (d, i) {
                var name = d["properties"]["name"].substr(0, 2);
                var cities = provinceaqi[format(date1)];
                for (var key in cities) {
                    //console.log(key);
                    if (key.substr(0, 2) == name) {
                        addpie(provincename, key);
                        line_chart(provincename, key);

                    }

                }
            })
        ;
        draw(provinceaqi, tooltipHtml)

    }

}

function datascale(aqi, target) {
    if (target == "co") {
        scaler = d3.scale.linear().domain([0, 20]).range([0, 500]);
    }
    else if (target == "no2") {
        scaler = d3.scale.linear().domain([0, 170]).range([0, 500]);
    }
    else if (target == "ozone1hour") {
        scaler = d3.scale.linear().domain([0, 250]).range([0, 500]);
    }
    else if (target == "pm10") {
        scaler = d3.scale.linear().domain([0, 1100]).range([0, 500]);
    }
    else if (target == "so2") {
        scaler = d3.scale.linear().domain([0, 270]).range([0, 500]);
    }
    else {
        scaler = d3.scale.linear().domain([0, 500]).range([0, 500]);
    }
    return scaler(aqi)
}

function addDefs(kind) {
    svg.selectAll("defs").remove();
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
        .attr("id", "myrect")
        .attr("x", 20)
        .attr("y", height - 20)
        .attr("width", 300)
        .attr("height", 20)
        .style("fill", "url(#" + linearGradient.attr("id") + ")");

    //添加文字
    svg.selectAll(".valueText").remove()
    var ValueText0 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 20)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            return "0";
        });
    var ValueText1 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 35)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "25"
            }
            else if (kind == "pm25") {
                return "25"
            }
            else if (kind == "pm10") {
                return "55"
            }
            else if (kind == "co") {
                return "1"
            }
            else if (kind == "so2") {
                return "14"
            }
            else if (kind == "no2") {
                return "9"
            }
            else {
                return "13"
            }
        });
    var ValueText2 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 65)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "75"
            }
            else if (kind == "pm25") {
                return "75"
            }
            else if (kind == "pm10") {
                return "165"
            }
            else if (kind == "co") {
                return "3"
            }
            else if (kind == "so2") {
                return "41"
            }
            else if (kind == "no2") {
                return "26"
            }
            else {
                return "38"
            }
        });
    var ValueText3 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 95)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "125"
            }
            else if (kind == "pm25") {
                return "125"
            }
            else if (kind == "pm10") {
                return "275"
            }
            else if (kind == "co") {
                return "5"
            }
            else if (kind == "so2") {
                return "68"
            }
            else if (kind == "no2") {
                return "43"
            }
            else {
                return "63"
            }
        });
    var ValueText4 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 125)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "175"
            }
            else if (kind == "pm25") {
                return "175"
            }
            else if (kind == "pm10") {
                return "385"
            }
            else if (kind == "co") {
                return "7"
            }
            else if (kind == "so2") {
                return "95"
            }
            else if (kind == "no2") {
                return "60"
            }
            else {
                return "88"
            }
        });
    var ValueText5 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 185)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "275"
            }
            else if (kind == "pm25") {
                return "275"
            }
            else if (kind == "pm10") {
                return "605"
            }
            else if (kind == "co") {
                return "11"
            }
            else if (kind == "so2") {
                return "149"
            }
            else if (kind == "no2") {
                return "94"
            }
            else {
                return "138"
            }
        });
    var ValueText6 = svg.append("text")
        .attr("class", "valueText")
        .attr("x", 320)
        .attr("y", height - 20)
        .attr("dy", "-0.3em")
        .text(function () {
            if (kind == "aqi") {
                return "500"
            }
            else if (kind == "pm25") {
                return "500"
            }
            else if (kind == "pm10") {
                return "1100"
            }
            else if (kind == "co") {
                return "20"
            }
            else if (kind == "so2") {
                return "270"
            }
            else if (kind == "no2") {
                return "170"
            }
            else {
                return "250"
            }
        });

}

function draw(data, toolTip) {
    function mouseOver(d) {
        d3.select("#tooltip").transition().duration(200).style("opacity", .9);
        if (mapstyle == 0) {
            var namelocal = d["properties"]["shortname"];
            console.log(namelocal);
            var datalocal = null;
            if (namelocal in data[format(date1)]) {
                datalocal = data[format(date1)][namelocal][QUALITY]
            }
        }
        else {
            var namelocal2 = d["properties"]["name"].substr(0, 2);
            var namelocal = d["properties"]["name"];
            var cityslocal = data[format(date1)];
            var datalocal = null;
            for (key in cityslocal) {
                // console.log(key)
                if (key.substr(0, 2) == namelocal2) {
                    datalocal = data[format(date1)][key][QUALITY]
                }
            }
        }

        d3.select("#tooltip").html(toolTip(namelocal, QUALITY, datalocal))
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY - 28) + "px");
    }

    function mouseOut() {
        d3.select("#tooltip").transition().duration(500).style("opacity", 0);
    }


    d3.select("#map").selectAll("path")
        .on("mouseover", mouseOver).on("mouseout", mouseOut);
}

function addpie(province, city) {
    d3.select("body").selectAll("#pie").remove();
    var piesvg = d3.select("body")
        .append("svg")
        .attr("id", "pie")
        .attr("width", 200)
        .attr("height", 200)
        .attr("style", style = "position:absolute;top:430px;left:700px");


    console.log(province);

    d3.json("data/" + province + ".json", function (error, data) {
        console.log(data);
        var dataset = count(data);
        console.log(dataset);
        var dataset_m = dataset[0];
        var datatree = tree(data, city);

        var pie = piesvg.append("g")
            .attr("transform", "translate(100, 100)")
            .attr("class", "pie");

        var arc_generator = d3.svg.arc()
            .innerRadius(25)//设置内半径
            .outerRadius(50);//设置外半径
        var radius = 100;

        var partition = d3.layout.partition()
            .sort(null)
            .size([2 * Math.PI, radius * radius])
            .value(function (d) {
                return 1;
            });
        drawpie(datatree);

        function drawpie(dataset) {
            var nodes = partition.nodes(dataset);
            console.log(nodes);
            var arc = d3.svg.arc()
                .startAngle(function (d) {
                    return d.x;
                })
                .endAngle(function (d) {
                    return d.x + d.dx;
                })
                .innerRadius(function (d) {
                    return Math.sqrt(d.y);
                })
                .outerRadius(function (d) {
                    return Math.sqrt(d.y + d.dy);
                });
            var arcs = pie.selectAll(".arc")
                .data(nodes)
                .enter().append("g").attr("class", "arc");

            arcs.append("path")
                .attr("display", function (d) {
                    return d.depth ? null : "none";
                }) // hide inner ring
                .attr("d", arc)
                .style("stroke", "#fff")
                .style("fill", function (d, i) {
                    var color = new Array(6);
                    color[0] = d3.rgb(106, 206, 6);
                    color[1] = d3.rgb(251, 208, 41);
                    color[2] = d3.rgb(254, 136, 0);
                    color[3] = d3.rgb(254, 0, 0);
                    color[4] = d3.rgb(151, 4, 84);
                    color[5] = d3.rgb(98, 0, 30);
                    console.log(Math.floor(d.data), i);
                    return color[Math.floor(d.data)]
                })
                .on("click", function (d) {

                    pie.selectAll(".arc").remove();
                    drawpie(d)
                    // d3.select(this)
                    //     .style("fill","yellow");
                });

        }


        var angle_data = d3.layout.pie();

        var date = new Date(date1.replace(/-/, "/"));
        var month = date.getMonth();
        pie.append("g")
            .selectAll("path")
            .data(angle_data(dataset_m[city]))
            .enter()
            .append("path")
            .attr("d", arc_generator)
            .style("fill", function (d, i) {
                var color = new Array(6);
                color[0] = d3.rgb(106, 206, 6);
                color[1] = d3.rgb(251, 208, 41);
                color[2] = d3.rgb(254, 136, 0);
                color[3] = d3.rgb(254, 0, 0);
                color[4] = d3.rgb(151, 4, 84);
                color[5] = d3.rgb(98, 0, 30);
                return color[i]
            });//给不同的扇形区填充不同的颜色

        // g.selectAll("text")//给每个扇形去添加对应文字
        //     .data(angle_data(dataset_m["吉林"][4]))
        //     .enter()
        //     .append("text")
        //     .text(function (d, i) {
        //         return d.value + "天"
        //     })
        //     .attr("transform", function (d) {
        //         return "translate(" + arc_generator.centroid(d) + ")"
        //     })//调成每个文字的对应位置
        //     .attr("text-anchor", "middle")//是文字居中
    });
}

function month_average(data) {
    var dataset = {};
    for (var datekey in data) {
        var date = new Date(datekey.replace(/-/, "/"));
        var month = date.getMonth()
        console.log(month);
        for (var citykey in data[datekey]) {
            if (citykey in dataset) {
                dataset[citykey][month] += data[datekey][citykey]["aqi"]
            }
            else {
                dataset[citykey] = new Array(12).fill(0);
                dataset[citykey][month] = data[datekey][citykey]["aqi"]

            }
        }

    }
    console.log(dataset);
    for (var citykey in data[datekey]) {
        for (var m = 0; m < 12; m++) {
            switch (m) {
                case 0:
                case 2:
                case 4:
                case 6:
                case 7:
                case 9:
                case 11:
                    dataset[citykey][m] = dataset[citykey][m] / 31;
                    break;
                case 1:
                    dataset[citykey][m] = dataset[citykey][m] / 28;
                    break;
                case 3:
                case 5:
                case 8:
                case 10:
                    dataset[citykey][m] = dataset[citykey][m] / 30;
                    break;

            }
        }

    }
    console.log(dataset);
    return dataset
}

function day_average(data) {
    var dataset = {};
    for (var datekey in data) {
        var date = new Date(datekey.replace(/-/, "/"));
        var month = date.getMonth();
        var day = date.getDate();
        console.log(month);
        for (var citykey in data[datekey]) {
            if (citykey in dataset) {
                dataset[citykey][month][day - 1] = data[datekey][citykey]["aqi"]
            }
            else {
                dataset[citykey] = new Array(12);
                for (var m = 0; m < 12; m++) {
                    dataset[citykey][m] = []
                }
                dataset[citykey][month][0] = data[datekey][citykey]["aqi"]


            }
        }

    }
    console.log(dataset);
    return dataset
}

function level(aqi) {
    switch (Math.floor(aqi / 50)) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return 4;
        case 5:
            return 4;
        case 6:
            return 5;
        default:
            return 5;

    }

}

function tree(data, city) {
    console.log(city);
    var datatree = {};
    datatree["children"] = [];
    var season_d = {"children": [], data: 0};
    var month_d = {"children": [], data: 0};
    datatree["children"].push(season_d);
    season_d["children"].push(month_d);
    var m0 = 0;
    var s0 = 0;
    for (var datekey in data) {
        var date = new Date(datekey.replace(/-/, "/"));
        var month = date.getMonth();
        // console.log(month);
        var citykey = city;
        // for (var citykey in data[datekey]) {
        var aqi = data[datekey][citykey]["aqi"];
        var day = {data: level(aqi)};
        if (Math.floor(month / 3) > s0) {
            console.log(s0);
            season_d = {"children": [], data: 0};
            datatree["children"].push(season_d);

            s0 += 1
        }
        if (month > m0) {
            month_d = {"children": [], data: 0};
            season_d["children"].push(month_d);

            m0 += 1;
            console.log(month);


        }
        month_d["children"].push(day);
        season_d.data += level(aqi) / 120.0;
        month_d.data += level(aqi) / 30


    }

    // var dataset={};

    console.log(datatree);
    return datatree
}

function count(data) {
    console.log(data);
    var dataset_d = {};
    var dataset_m = {};
    var dataset_s = {};
    var dataset_y = {};
    for (var datekey in data) {
        var date = new Date(datekey.replace(/-/, "/"));
        var month = date.getMonth();
        // console.log(month);
        for (var citykey in data[datekey]) {
            var aqi = data[datekey][citykey]["aqi"];
            if (citykey in dataset_m) {

                dataset_m[citykey][month][level(aqi)] += 1;
                dataset_d[citykey][month].push(level(aqi))

            }
            else {
                dataset_m[citykey] = new Array(12);
                dataset_d[citykey] = new Array(12);
                for (var m = 0; m < 12; m++) {
                    dataset_m[citykey][m] = new Array(6).fill(0);
                    dataset_d[citykey][m] = [];

                }
                dataset_m[citykey][0][level(aqi)] += 1;
                dataset_d[citykey][0].push(level(aqi))
            }
        }

    }
    for (var citykey in dataset_m) {
        if (!(citykey in dataset_y)) {
            dataset_s[citykey] = new Array(4);
            for (var s = 0; s < 4; s++) {
                dataset_s[citykey][s] = new Array(6).fill(0);

            }
            dataset_y[citykey] = new Array(6).fill(0);
        }
        for (var m = 0; m < 12; m++) {
            for (var l = 0; l < 6; l++) {
                dataset_y[citykey][l] += dataset_m[citykey][m][l];
                dataset_s[citykey][Math.floor(l / 3)][l] += dataset_m[citykey][m][l]
            }

        }
    }
    return [dataset_y, dataset_s, dataset_m, dataset_d]
}


function line_chart(province, city) {
    var width = 500, height = 300;
    // SVG画布边缘与图表内容的距离
    var padding = {top: 50, right: 50, bottom: 50, left: 100};
    // 创建一个分组用来组合要画的图表元素
    d3.select("body").selectAll("#linechart").remove();
    var linesvg = d3.select("body")
        .append("svg")
        .attr("id", "linechart")
        .attr("width", width)
        .attr("height", height)
        .attr("style", style = "position:absolute;top:130px;left:700px");

    var linechart = linesvg.append('g')
        .attr('transform', "translate(" + padding.left + ',' + padding.top + ')')
        .attr("class", "chart");
    queue()
        .defer(d3.json, "data/" + province + ".json")
        .await(ready);
    var date = new Date(date1.replace(/-/, "/"));
    var month = date.getMonth();

    function ready(error, cityair) {
        var dataset = day_average(cityair)[city][month];
        var title = province + "省" + city + "市" + (month + 1) + "月" + "空气质量折线图";
        var xtitle = "时间";
        var ytitle = "空气质量";
        console.log(dataset);


        var xScale = d3.scale.linear()
            .domain(d3.extent(dataset, function (d, i) {
                return i + 1;
            }))
            .range([0, width - padding.left - padding.right]);
        // 创建y轴的比例尺(线性比例尺)
        var yScale = d3.scale.linear()
            .domain([0, d3.max(dataset, function (d, i) {
                return d;
            })])
            .range([height - padding.top - padding.bottom, 0]);
        // 创建x轴
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .orient('bottom');
        // 创建y轴
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .orient('left');
        // 添加SVG元素并与x轴进行“绑定”
        linechart.append('g')
            .attr('class', 'axis')
            .attr('transform', 'translate(0,' + (height - padding.top - padding.bottom) + ')')
            .call(xAxis);
        // 添加SVG元素并与y轴进行“绑定”
        linechart.append('g')
            .attr('class', 'axis')
            .call(yAxis);
        // 添加折线
        var line = d3.svg.line()
            .x(function (d, i) {
                return xScale(i + 1)
            })
            .y(function (d, i) {
                return yScale(d);
            })
            // 选择线条的类型
            .interpolate('linear');
        // 添加path元素，并通过line()计算出值来赋值
        linechart.append('path')
            .attr('class', 'line')
            .attr('d', line(dataset));
        // 添加点
        linechart.selectAll('circle')
            .data(dataset)
            .enter()
            .append('circle')
            .attr('cx', function (d, i) {
                return xScale(i + 1);
            })
            .attr('cy', function (d) {
                return yScale(d);
            })
            .attr('r', 5)
            .attr('fill', function (d, i) {
                return computeColor(d);
            });
        linechart.append("text")
            .text(title)
            .attr("class", "title")
            .attr("x", width / 2 - 40)
            .attr("y", 0)
            .attr("text-anchor", "middle");
        linechart.append("text")
            .text(xtitle)
            .attr("class", "xtitle")
            .attr("x", width / 2 - 40)
            .attr("y", height - 60)
            .attr("text-anchor", "middle");
        linechart.append("text")
            .text(ytitle)
            .attr("class", "ytitle")
            .attr("text-anchor", "middle")
            .attr("transform", "translate(-50,100)rotate(270)")
        ;

    }


    function getColor(idx) {
        var palette = [
            '#2ec7c9', '#b6a2de', '#5ab1ef', '#ffb980', '#d87a80',
            '#8d98b3', '#e5cf0d', '#97b552', '#95706d', '#dc69aa',
            '#07a2a4', '#9a7fd1', '#588dd5', '#f5994e', '#c05050',
            '#59678c', '#c9ab00', '#7eb00a', '#6f5553', '#c14089'
        ]
        return palette[idx % palette.length];
    }
}