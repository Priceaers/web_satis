/* Asil Sigorta: canlı sıvı cam küre (WebGL, kütüphanesiz) + 3B yörüngede dönen etiketler */
(() => {
  const wrap = document.getElementById("orb");
  if (!wrap) return;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = window.matchMedia("(pointer: fine)").matches;

  /* ---------------- küre ---------------- */
  const canvas = wrap.querySelector(".orb-gl");
  const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
  let visible = true, raf = 0, t0 = performance.now();

  if (gl) {
    const vs = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";
    const fs = `
precision highp float;
uniform vec2 uRes; uniform float uT; uniform vec2 uM;
float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);
  return mix(mix(h(i),h(i+vec2(1,0)),u.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),u.x),u.y);}
float fbm(vec2 p){float v=0.,a=.5;mat2 r=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n(p);p=r*p*2.02;a*=.5;}return v;}
void main(){
  vec2 p=(gl_FragCoord.xy-.5*uRes)/uRes.y*2.;      // -1..1
  float R=.80; float d=length(p);
  float t=uT;
  vec3 col=vec3(0.); float a=0.;
  // dış hale
  float halo=exp(-max(d-R,0.)*9.)*.16*smoothstep(R-.02,R+.01,d)*smoothstep(.99,.86,d);
  if(d<R){
    vec2 q=p/R; float z=sqrt(max(1.-dot(q,q),0.));
    vec3 N=normalize(vec3(q,z));
    // kırılma: içerideki sıvıyı yüzeye göre kaydır
    vec2 rp=q*(1.25-.35*z)+N.xy*.35+uM*.18;
    vec2 w=vec2(fbm(rp*.9+vec2(t*.05,-t*.04)),fbm(rp*.9+vec2(-t*.04,t*.06)+3.1));
    float liq=fbm(rp*1.1+w*1.4+t*.03);
    // ince akış çizgileri (kostik ışık)
    float lines=pow(abs(sin(liq*7.+t*.45)),60.)*.28;
    float bands=smoothstep(.5,.85,liq)*.10;
    float glow=smoothstep(.9,.0,length(q-vec2(.25,-.35)))*.10;   // içten gelen yumuşak ışık
    vec3 base=vec3(.012,.012,.015)+vec3(bands)+vec3(lines)*z*z+vec3(glow);
    // ışık (fareyle hareket eder)
    vec3 L=normalize(vec3(-.45+uM.x*.8,.55+uM.y*.8,.9));
    float spec=pow(max(dot(reflect(-L,N),vec3(0,0,1)),0.),60.);
    float spec2=pow(max(dot(reflect(-normalize(vec3(.6,-.5,.6)),N),vec3(0,0,1)),0.),18.)*.18;
    float fres=pow(1.-z,3.2);
    // kenarda beyaz kırılma halkası
    float rim=smoothstep(.0,.08,1.-length(q))*smoothstep(.16,.0,1.-length(q));
    float edgeSweep=.5+.5*sin(atan(q.y,q.x)*1.-t*.8);
    col=base+vec3(fres*.9)+vec3(spec*1.2)+vec3(spec2)+vec3(rim*.45*edgeSweep);
    col+=vec3(.0,.004,.012)*fres;           // çok hafif soğuk ton
    a=1.;
    float aa=smoothstep(R,R-.006,d);
    col*=aa; a*=aa;
  }
  col+=vec3(halo); a=max(a,halo);
  gl_FragColor=vec4(col,a);
}`;
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; };
    const v = sh(gl.VERTEX_SHADER, vs), f = sh(gl.FRAGMENT_SHADER, fs);
    const prog = gl.createProgram();
    if (v && f) { gl.attachShader(prog, v); gl.attachShader(prog, f); gl.linkProgram(prog); }
    if (v && f && gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      gl.useProgram(prog);
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      const uRes = gl.getUniformLocation(prog, "uRes"), uT = gl.getUniformLocation(prog, "uT"), uM = gl.getUniformLocation(prog, "uM");

      const size = () => {
        const r = canvas.getBoundingClientRect();
        const dpr = Math.min(window.devicePixelRatio || 1, 1.75);
        canvas.width = Math.max(2, Math.round(r.width * dpr));
        canvas.height = Math.max(2, Math.round(r.height * dpr));
        gl.viewport(0, 0, canvas.width, canvas.height);
      };
      size(); addEventListener("resize", size);

      const draw = (now) => {
        mouse.x += (mouse.tx - mouse.x) * 0.06; mouse.y += (mouse.ty - mouse.y) * 0.06;
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform1f(uT, reduce ? 8 : (now - t0) / 1000);
        gl.uniform2f(uM, mouse.x, mouse.y);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      };
      const loop = (now) => { draw(now); raf = visible && !reduce ? requestAnimationFrame(loop) : 0; };
      wrap.classList.add("gl");
      loop(performance.now());
      new IntersectionObserver((es) => {
        visible = es[0].isIntersecting;
        if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
      }).observe(wrap);
      document.addEventListener("visibilitychange", () => {
        visible = !document.hidden;
        if (visible && !raf && !reduce) raf = requestAnimationFrame(loop);
      });
    }
  }

  /* fare: küredeki ışık ve logonun eğimi */
  const logo = wrap.querySelector(".orb-logo");
  if (fine && !reduce) {
    addEventListener("pointermove", (e) => {
      const r = wrap.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) / innerWidth * 2;
      const y = -(e.clientY - (r.top + r.height / 2)) / innerHeight * 2;
      mouse.tx = Math.max(-1, Math.min(1, x)); mouse.ty = Math.max(-1, Math.min(1, y));
      logo.style.setProperty("--lx", mouse.tx * 14 + "deg");
      logo.style.setProperty("--ly", mouse.ty * 14 + "deg");
    }, { passive: true });
  }

  /* ---------------- 3B yörünge ---------------- */
  const orbit = wrap.querySelector(".orbit");
  const chips = [...orbit.querySelectorAll(".chip")];
  if (reduce || !chips.length) return;
  orbit.classList.add("live");
  let ang = 0, speed = 0.0045, target = 0.0045, last = performance.now();
  orbit.addEventListener("pointerenter", () => (target = 0));
  orbit.addEventListener("pointerleave", () => (target = 0.0045));
  orbit.addEventListener("focusin", () => (target = 0));
  orbit.addEventListener("focusout", () => (target = 0.0045));
  const step = (now) => {
    const dt = Math.min(48, now - last); last = now;
    speed += (target - speed) * 0.08;
    ang += speed * dt / 16;
    const W = wrap.clientWidth;
    const rx = W * 0.52, ry = W * 0.24, tilt = -0.18; // eğik elips
    chips.forEach((c, i) => {
      const a = ang + (i / chips.length) * Math.PI * 2;
      const cx = Math.cos(a) * rx, cz = Math.sin(a);           // cz>0: önde
      const cy = Math.sin(a) * ry + cx * tilt;
      const s = 0.78 + 0.28 * (cz + 1) / 2;
      const front = cz > -0.05;
      c.classList.toggle("back", !front);
      c.style.zIndex = front ? 5 : 1;
      c.style.opacity = (0.35 + 0.65 * (cz + 1) / 2).toFixed(3);
      c.style.filter = front ? "none" : "blur(" + ((-cz) * 2.2).toFixed(2) + "px)";
      c.style.transform = "translate(-50%,-50%) translate(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px) scale(" + s.toFixed(3) + ")";
    });
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
})();
