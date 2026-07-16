// import React, { useState, useEffect, useRef } from 'react'
// import "../styles/team-section.css"
// import { random } from 'gsap';

// function TeamProfile() {

//     const INITIAL_POSITIONS = [
//         { top: "0%", left: "4%", rotate: 10 },
//         { top: "45%", left: "0%", rotate: -6 },
//         { top: "-10%", left: "33%", rotate: -10 },
//         { top: "-5%", left: "53%", rotate: -50 },
//         { top: "20%", left: "70%", rotate: -7 },
//         { top: "60%", left: "80%", rotate: 15 },
//         { top: "58%", left: "40%", rotate: 15 },

//         // { top: "70%", left: "55%", rotate: 8 },
//     ];

//     const Engine = Matter.Engine;
//     const World = Matter.World;
//     const Bodies = Matter.Bodies;
//     const Body = Matter.Body;

//     let engine;
//     let items = []
//     let lastMouseX = -1;
//     let lastMouseY = -1;

//     function setup() {
//         createCanvas(window.innerWidth, window.innerHeight);
//         engine = Engine.create()
//         engine.world.gravity.y = 0
//         addBoundaries();

//         for (let i = 0; i < 12; i++) {
//             let x = random(100, width - 100)
//             let y = random(100, height - 100)
//             items.push(new Item(x, y, `/img${i + 1}.jpg`))
//         }
//     }

//     function addBoundaries() {
//         const thickness = 50;
//         World.add(engine.World, [
//             Bodies.rectangle(width / 2, -thickness / 2, width, thickness, {
//                 isStatic: true,
//             })

//             Bodies.rectangle(
//                 width / 2,
//                 height + thickness / 2,
//                 width,
//                 thickness,
//                 {
//                     isStatic: true
//                 }
//             )

//               Bodies.rectangle(
//                 -thickness / 2,
//                 height / 2,
//                 thickness,
//                 height,
//                 {
//                     isStatic: true
//                 }
//             )

//                Bodies.rectangle(
//                 width + thickness / 2,
//                 height / 2,
//                 thickness,
//                 height,
//                 {
//                     isStatic: true
//                 }
//             )
//         ])
//     }

//     function draw() {
//         background("black")
//         Engine.update(engine)
//         items.forEach((item) => ite.update())
//     }

//     const Item {
//         constructor(x, y, imagePath){
//             let options = {
//                 frictionAir: 0.075,
//                 restitution: 0.25,
//                 density: 0.002,
//                 angle: Math.random() * Math.PI * 2;

//             }
//         }

//     this.body = Bodies.rectangle(x, y, 100, 200, options)
//     World.add(engine.World, this.body)

//     this.div = document.createElement("div");
//     this.div.className = "item";

//     // position
//     this.div.style.left = `${this.body.position.x}px`;
//     this.div.style.top = `${this.body.position.y}px`;

//     const img = document.createElement("img");
//     img.src = imagePath;

//     this.div.appendChild(img);
//     document.body.appendChild(this.div);

// }

// update() {
//   this.div.style.left = `${this.body.position.x - 50}px`;
//   this.div.style.top = `${this.body.position.y - 100}px`;
//   this.div.style.transform = `rotate(${this.body.angle}rad)`;
// }

// function MouseMoved (){
// if (dist(mouseX, mouseY, lastMouseX, lastMouseY) > 10) {
//   lastMouseX = mouseX;
//   lastMouseY = mouseY;

//   items.forEach((item) => {
//     if (
//       dist(
//         mouseX,
//         mouseY,
//         item.body.position.x,
//         item.body.position.y
//       ) < 150
//     ) {
//       let forceMagnitude = 3;
//       Body.applyForce(
//         item.body,{
//             x:item.body.position.x,
//             y:item.body.position.y,
//         }, {
//             x: random(-forceMagnitude, forceMagnitude),
//             y: random(-forceMagnitude, forceMagnitude)
//         }
//       )
//     }
//   });
// }
// }

// const [positions, setPositions] = useState([]);

// useEffect(() => {
//     setPositions(INITIAL_POSITIONS.slice(0, CARD_COUNT));
// }, []);

// const CARD_COUNT = 8;

// function getRandomPosition() {
//     return {
//         top: Math.random() * 70 + "%",
//         left: Math.random() * 80 + "%",
//         rotate: Math.random() * 20 - 10,
//     };
// }

// return (
//     <div className='team-section-container'>

//         <div className='team-section-wrapper'>
//             <div className='team-section-content'>
//                 <h1>The collective behind every experience</h1>
//                 <p>Have an idea or project in mind? We’re here to turn your vision into a powerful digital experience. Let’s collaborate and build something that truly stands out.</p>
//             </div>

//             {positions.map((pos, i) => (
//                 <div
//                     key={i}
//                     className="item-card"
//                     style={{
//                         position: "absolute",
//                         top: pos.top,
//                         left: pos.left,
//                         transform: `rotate(${pos.rotate}deg)`,
//                     }}
//                 >
//                     <div className="item-card-image">
//                         <img src="/card1.jpg" alt="" />
//                     </div>
//                     <h1 className="item-name">Lorem Ipsum</h1>
//                     <p className="item-designation">Designation</p>
//                 </div>
//             ))}

//         </div>

//     </div>
// )
// }

// export default TeamProfile

'use client';

import React, { useEffect, useRef } from "react";
import "../../styles/team-profile.css";
import Matter from "matter-js";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";

const CARD_COUNT = 12;
const MOBILE_CARDS = Array.from({ length: CARD_COUNT }, (_, i) => ({
  id: i,
  image: "/team.jpg",
  name: "Lorem Ipsum",
  designation: "Designation",
}));

const INITIAL_POSITIONS = [
  { x: 0.06, y: 0.15, rotate: 10 },
  { x: 0.01, y: 0.6, rotate: -6 },
  { x: 0.33, y: 0.08, rotate: -10 },
  { x: 0.53, y: 0.1, rotate: -5 },
  { x: 0.7, y: 0.28, rotate: -7 },
  { x: 0.78, y: 0.68, rotate: 15 },
  { x: 0.4, y: 0.65, rotate: 15 },

  // New positions
  { x: 0.15, y: 0.32, rotate: 8 },
  { x: 0.25, y: 0.78, rotate: -12 },
  { x: 0.58, y: 0.42, rotate: 6 },
  { x: 0.82, y: 0.12, rotate: -9 },
  { x: 0.9, y: 0.52, rotate: 11 },
];

const CARD_W = 220;
const CARD_H = 240;

export default function TeamProfile() {
  const wrapperRef = useRef(null);
  const engineRef = useRef(null);
  const itemsRef = useRef([]);
  const rafRef = useRef(null);
  const cleanupRef = useRef(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;

    let cancelled = false;
    let timeoutId = null;

    const tryInit = () => {
      if (cancelled) return;
      const wrapper = wrapperRef.current;
      if (!wrapper) {
        timeoutId = setTimeout(tryInit, 50);
        return;
      }
      const W = wrapper.offsetWidth;
      const H = wrapper.offsetHeight;
      if (W === 0 || H === 0) {
        timeoutId = setTimeout(tryInit, 50);
        return;
      }
      initialized.current = true;
      init(wrapper, W, H);
    };

    tryInit();

    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      cancelAnimationFrame(rafRef.current);
      cleanupRef.current?.();
      itemsRef.current.forEach(({ div }) => div?.parentNode?.removeChild(div));
      itemsRef.current = [];
      if (engineRef.current) {
        Matter.World.clear(engineRef.current.world);
        Matter.Engine.clear(engineRef.current);
        engineRef.current = null;
      }
      initialized.current = false;
    };
  }, []);

  function init(wrapper, W, H) {
    const { Engine, World, Bodies, Body } = Matter;

    const engine = Engine.create();
    engine.world.gravity.y = 0;
    engineRef.current = engine;

    const T = 60;
    World.add(engine.world, [
      Bodies.rectangle(W / 2, -T / 2, W, T, { isStatic: true }),
      Bodies.rectangle(W / 2, H + T / 2, W, T, { isStatic: true }),
      Bodies.rectangle(-T / 2, H / 2, T, H, { isStatic: true }),
      Bodies.rectangle(W + T / 2, H / 2, T, H, { isStatic: true }),
    ]);

    INITIAL_POSITIONS.slice(0, CARD_COUNT).forEach((pos, i) => {
      const x = Math.min(pos.x * W + CARD_W / 2, W - CARD_W / 2 - 10);
      const y = Math.min(pos.y * H + CARD_H / 2, H - CARD_H / 2 - 10);
      const angleRad = (pos.rotate * Math.PI) / 180;

      const body = Bodies.rectangle(x, y, CARD_W, CARD_H, {
        frictionAir: 0.04,
        restitution: 0.5,
        density: 0.00003,
        angle: angleRad,
      });
      World.add(engine.world, body);

      const div = document.createElement("div");
      div.className = "item-card";
      div.style.cssText = `
        position: absolute;
        top: 0; left: 0;
        width: ${CARD_W}px;
        height: ${CARD_H}px;
        will-change: transform;
        cursor: grab;
        transform-origin: center center;
        transform: translate(${x - CARD_W / 2}px, ${y - CARD_H / 2}px) rotate(${angleRad}rad);
      `;
      div.innerHTML = `
         <div class="item-card-image">
          <img src="/card2.jpg" alt="Team member ${i + 1}" />
         </div>
        <h2 class="item-name">Lorem Ipsum</h2>
        <p class="item-designation">Designation</p>
      `;
      wrapper.appendChild(div);
      itemsRef.current.push({ body, div });
    });

    let lastTime = 0;
    function loop(timestamp) {
      const delta =
        lastTime > 0 ? Math.min(timestamp - lastTime, 50) : 1000 / 60;
      lastTime = timestamp;
      Engine.update(engine, delta);
      itemsRef.current.forEach(({ body, div }) => {
        const { x, y } = body.position;
        div.style.transform = `translate(${(x - CARD_W / 2).toFixed(2)}px, ${(y - CARD_H / 2).toFixed(2)}px) rotate(${body.angle.toFixed(5)}rad)`;
      });
      rafRef.current = requestAnimationFrame(loop);
    }
    rafRef.current = requestAnimationFrame(loop);

    // ✅ Fixed: attach to wrapper, not window; removed broken delta-throttle
    function onMouseMove(e) {
      const rect = wrapper.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      itemsRef.current.forEach(({ body }) => {
        const bx = body.position.x;
        const by = body.position.y;
        const dist = Math.sqrt((mx - bx) ** 2 + (my - by) ** 2);

        if (dist < 300 && dist > 0) {
          const mag = 0.11 * (1 - dist / 300);
          Body.applyForce(body, body.position, {
            x: ((bx - mx) / dist) * mag,
            y: ((by - my) / dist) * mag,
          });
        }
      });
    }

    // ✅ Attach to wrapper so it only fires inside the physics area
    wrapper.addEventListener("mousemove", onMouseMove);
    cleanupRef.current = () =>
      wrapper.removeEventListener("mousemove", onMouseMove);
  }

  const sectionHeading = (
    <div className="team-section-content">
      <h1>The collective behind every experience</h1>
      <p>
        Have an idea or project in mind? We&apos;re here to turn your vision
        into a powerful digital experience. Let&apos;s collaborate and build
        something that truly stands out.
      </p>
    </div>
  );

  return (
    <>
      <div className="team-section-container" ref={wrapperRef}>
        <div className="team-section-wrapper">{sectionHeading}</div>
      </div>

      {/* Mobile-only: the Matter.js physics scatter above is desktop-only
          (see .team-section-container display:none at the mobile
          breakpoint) — on mobile the same cards are shown as a swipeable
          carousel instead. */}
      <div className="team-section-mobile">
        {sectionHeading}

        <Swiper
          slidesPerView={1}
          spaceBetween={20}
          className="team-mobile-swiper"
        >
          {MOBILE_CARDS.map((card) => (
            <SwiperSlide key={card.id}>
              <div className="item-card">
                <div className="item-card-image">
                  <img src={card.image} alt={card.name} />
                </div>
                <h2 className="item-name">{card.name}</h2>
                <p className="item-designation">{card.designation}</p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </>
  );
}
