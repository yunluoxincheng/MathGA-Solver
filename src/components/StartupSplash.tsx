"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function StartupSplash() {
  const [visible, setVisible] = useState(true);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const leaveTimer = window.setTimeout(() => setLeaving(true), 1100);
    const removeTimer = window.setTimeout(() => setVisible(false), 1550);

    return () => {
      window.clearTimeout(leaveTimer);
      window.clearTimeout(removeTimer);
    };
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className={`fixed inset-0 z-50 grid min-h-screen place-items-center bg-bg transition-opacity duration-500 ${
        leaving ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="startup-icon-wrap relative grid h-44 w-44 place-items-center overflow-hidden rounded-[2rem] border border-border bg-bg-card shadow-xl shadow-primary/10 sm:h-48 sm:w-48">
          <Image
            src="/mathga-icon-192.png"
            alt=""
            width={150}
            height={150}
            priority
            className="startup-icon-base rounded-[1.65rem]"
          />
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-primary">MathGA Solver</div>
          <div className="mt-2 flex items-end justify-center gap-1.5">
            {[0, 1, 2, 3, 4].map((item) => (
              <span
                key={item}
                className="startup-bar block w-2 rounded-full bg-secondary"
                style={{ animationDelay: `${item * 90}ms` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
