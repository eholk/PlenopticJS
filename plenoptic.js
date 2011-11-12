var vertex_src =
"      attribute vec4 aVertexPosition;" +
"      void main() {" +
//"        gl_TexCoord[0] = gl_MultiTexCoord0;" +
"        gl_Position = aVertexPosition;" +
"      }";

var frag_src = 
"      void main() { " +
"        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0);" +
"      }";

var gl = null;

function start() {
    var canvas = document.getElementById("glcanvas");

    gl = initWebGL(canvas);

    gl.clearColor(0, 0, 0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    vbuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuf);
    vertices = [
        160, 120, 0.0,
            480, 120, 0.0,
        480, 360, 0.0,
            160, 360, 0.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices),
                  gl.STATIC_DRAW);

    // DRAW!
    gl.vertexAttribPointer(vbuf, 3, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.QUADS, 0, 4);
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