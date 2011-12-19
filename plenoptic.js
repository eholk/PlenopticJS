var vertex_src =
"      attribute vec3 aVertexPosition;" +
"      attribute vec2 tex_coord;" + 
"      varying highp vec2 vtex_coord;" + 
"      void main() {" +
"        vtex_coord = tex_coord;" +
"        gl_Position = vec4(aVertexPosition, 1.0);" +
"      }";

var gl = null;

var errors = [];

function checkgl() {
    var e = gl.getError();
    if(e) console.error("WebGL produced error " + errors[e] + " (" + e + ")");
}

function start() {
    var canvas = document.getElementById("glcanvas");

    gl = initWebGL(canvas);
}

function initBuffers() {
    vertices = [
       -1.0, -1.0, 0.0,
        1.0, -1.0, 0.0,
        1.0,  1.0, 0.0,
       -1.0,  1.0, 0.0
    ];

    tcoords = [
        0, 0,
        1, 0,
        1, 1,
        0, 1
    ];

    vbuf = gl.createBuffer();
    checkgl();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    checkgl();
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
                  gl.STATIC_DRAW);
    checkgl();
    tbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(tcoords),
                  gl.STATIC_DRAW);
    checkgl();
}

function setParam(name) {
    var attrib = gl.getUniformLocation(prog, name);
    var el = document.getElementById(name);
    gl.uniform1f(attrib, el.value);
}

function draw() {
    console.info("Drawing");

    // set the shader parameters
    $('input.param').each(function (i, p) {
        setParam(p.id);
    });

    // Actually draw
    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tx);
    tex_attr = gl.getUniformLocation(prog, "tex")
    gl.uniform1i(tex_attr, 0);
    
    checkgl();
    
    // DRAW!
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    gl.vertexAttribPointer(vattr, 3, gl.FLOAT, false, 0, 0);
    checkgl();
    gl.bindBuffer(gl.ARRAY_BUFFER, tbuf);
    gl.vertexAttribPointer(tattr, 2, gl.FLOAT, false, 0, 0);
    checkgl();
    //gl.disableVertexAttribArray(tattr);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    checkgl();
}

function loadTexture(url) {
    tx = gl.createTexture();
    img = new Image();
    img.onload = function () {
        gl.bindTexture(gl.TEXTURE_2D, tx);
        checkgl();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      img);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        checkgl();
        
        console.info("Texture loaded, about to draw...");

        draw();
    }
    img.src = url;
}

function readContents(iframe) {
    return iframe.document.getElementsByTagName("pre")[0].innerText;
}

function initWebGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {
        console.error("Error getting context.");
    }

    if(!gl) {
        console.error("Your browser doesn't appear to support WebGL.");
    }

    // initialize error strings
    for(x in gl) {
        errors[gl[x]] = x;
    }

    // initialize shaders
    vshade = makeShader(vertex_src, gl.VERTEX_SHADER);
    $.get("plenoptic.txt", function(frag_src) {
        fshade = makeShader(frag_src, gl.FRAGMENT_SHADER);
        prog = gl.createProgram();
          
        gl.attachShader(prog, vshade);
        gl.attachShader(prog, fshade);
        gl.linkProgram(prog);
        
        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program.");
        }
        
        gl.useProgram(prog);

        // set up attributes
        vattr = gl.getAttribLocation(prog, "aVertexPosition");
        gl.enableVertexAttribArray(vattr);
        checkgl();
        
        tattr = gl.getAttribLocation(prog, "tex_coord");
        gl.enableVertexAttribArray(tattr);
        checkgl();

        initBuffers();
        loadTexture("253a-crop.jpg");
    });

    return gl;
}

function makeShader(src, type) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("An error occurred compiling the shaders: "
                      + gl.getShaderInfoLog(shader));
        return null;
    }
  
  return shader;    
}