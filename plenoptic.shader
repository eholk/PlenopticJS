// -*- c -*-

varying highp vec2 vtex_coord;
uniform sampler2D tex;

void main() { 
  gl_FragColor = texture2D(tex, vtex_coord);
}
