var vertex_src =
"      attribute vec3 aVertexPosition;" +
"      attribute vec2 tex_coord;" + 
"      varying highp vec2 vtex_coord;" + 
"      void main() {" +
"        vtex_coord = tex_coord;" +
"        gl_Position = vec4(aVertexPosition, 1.0);" +
"      }";

var frag_src = 
"      varying highp vec2 vtex_coord;" +
"      uniform sampler2D tex;" +
"      void main() { " +
"        gl_FragColor  = vec4(0.0, 0.0, 1.0, 1.0);" +
"        gl_FragColor += texture2D(tex, vtex_coord);" +
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
    initBuffers();

    loadTexture("253a-crop.png");
}

function initBuffers() {
    vertices = [
        0.0-0.5, 0.0-0.5, 0.0,
        1.0-0.5, 0.0-0.5, 0.0,
        1.0-0.5, 1.0-0.5, 0.0,
        0.0-0.5, 1.0-0.5, 0.0
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

function draw() {
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
        //alert("" + img.width + " " + img.height);
        gl.bindTexture(gl.TEXTURE_2D, tx);
        img.width=1024;
        img.height=1024;
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
                      img);
        
        checkgl();
        
        //gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        //checkgl();

        draw();
    }
    img.src = url;
}

function initWebGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
    }
    catch(e) {
        alert("Error getting context.");
    }

    if(!gl) {
        alert("Your browser doesn't appear to support WebGL.");
    }

    // initialize error strings
    for(x in gl) {
        errors[gl[x]] = x;
    }

    // initialize shaders
    vshade = makeShader(vertex_src, gl.VERTEX_SHADER);
    fshade = makeShader(frag_src, gl.FRAGMENT_SHADER);

    prog = gl.createProgram();
    gl.attachShader(prog, vshade);
    gl.attachShader(prog, fshade);
    gl.linkProgram(prog);

    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        alert("Unable to initialize the shader program.");
    }
    
    gl.useProgram(prog);

    // set up attributes
    vattr = gl.getAttribLocation(prog, "aVertexPosition");
    gl.enableVertexAttribArray(vattr);
    checkgl();
    
    tattr = gl.getAttribLocation(prog, "tex_coord");
    gl.enableVertexAttribArray(tattr);
    checkgl();

    return gl;
}

function makeShader(src, type) {
    var shader = gl.createShader(type);

    gl.shaderSource(shader, src);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert("An error occurred compiling the shaders: "
              + gl.getShaderInfoLog(shader));
        return null;
    }
  
  return shader;    
}