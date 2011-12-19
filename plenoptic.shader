// -*- c -*-

precision highp float;

varying vec2 vtex_coord;

uniform sampler2D tex;
uniform float num_micro_images_x, num_micro_images_y;
uniform float pitch;
uniform float view_x, view_y;

void main() {
    vec2 num_micro_images = vec2(num_micro_images_x, num_micro_images_y);
    vec2 micro_image = vtex_coord * num_micro_images;
    vec2 offset = micro_image - floor(micro_image);
    micro_image = floor(micro_image);

    vec2 view_shift = vec2(view_x, view_y);
    
    vec2 lf_pos = (micro_image + view_shift - pitch * offset) / num_micro_images;
    gl_FragColor = texture2D(tex, lf_pos);
}
