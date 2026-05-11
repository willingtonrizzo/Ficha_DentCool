import { STATES } from './data';

export function Tooth({ fdi, surfaces, selected, selectedSurface, onSelect, onSelectSurface }) {
  const quad = Math.floor(fdi / 10);
  const isUpper = quad === 1 || quad === 2;
  const mesialSide = quad === 1 || quad === 4 ? 'right' : 'left';
  const W = 40;
  const H = 52;
  const pad = 2;
  const x0 = pad;
  const y0 = pad;
  const x1 = W - pad;
  const y1 = H - pad;
  const cx0 = W * 0.3;
  const cx1 = W * 0.7;
  const cy0 = H * 0.26;
  const cy1 = H * 0.74;

  const polys = {
    top: [[x0, y0], [x1, y0], [cx1, cy0], [cx0, cy0]],
    bottom: [[x0, y1], [x1, y1], [cx1, cy1], [cx0, cy1]],
    left: [[x0, y0], [x0, y1], [cx0, cy1], [cx0, cy0]],
    right: [[x1, y0], [x1, y1], [cx1, cy1], [cx1, cy0]],
    center: [[cx0, cy0], [cx1, cy0], [cx1, cy1], [cx0, cy1]],
  };

  const surfaceMap = {
    O: 'center',
    V: isUpper ? 'bottom' : 'top',
    L: isUpper ? 'top' : 'bottom',
    M: mesialSide === 'right' ? 'right' : 'left',
    D: mesialSide === 'right' ? 'left' : 'right',
  };

  const stateColor = (state) => (STATES[state] || STATES.sano).hex;

  const handleSurfaceClick = (e, sk) => {
    e.stopPropagation();
    onSelect(fdi);
    onSelectSurface(sk);
  };

  const isAbsent = surfaces.O === 'ausente' && surfaces.M === 'ausente';
  const isToExtract = surfaces.O === 'extr' && surfaces.M === 'extr';
  const isImplant = surfaces.O === 'implante' && surfaces.M === 'implante';
  return (
    <div className={`tooth-cell ${selected ? 'selected' : ''}`}>
      {isUpper && <div className="tooth-num">{fdi}</div>}
      <div className="tooth-svg-wrap" onClick={() => onSelect(fdi)}>
        <svg className="tooth-svg" width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
          <rect x={x0} y={y0} width={x1 - x0} height={y1 - y0} rx="13" fill="white" stroke="#D4DEE8" strokeWidth="1" />

          {!isAbsent && Object.entries(surfaceMap).map(([sk, polyKey]) => {
            const state = surfaces[sk] || 'sano';
            const fill = stateColor(state);
            const isSel = selected && selectedSurface === sk;
            return (
              <polygon
                key={sk}
                points={polys[polyKey].map((p) => p.join(',')).join(' ')}
                fill={state === 'sano' ? 'white' : fill}
                stroke={isSel ? '#2563EB' : '#D8E1EA'}
                strokeWidth={isSel ? 1.6 : 0.7}
                style={{ cursor: 'pointer' }}
                onClick={(e) => handleSurfaceClick(e, sk)}
              />
            );
          })}

          {isImplant && (
            <g>
              <rect x={W / 2 - 3} y={H * 0.55} width="6" height={H * 0.4} fill="#475569" rx="1" />
              <line x1={W / 2 - 4} y1={H * 0.62} x2={W / 2 + 4} y2={H * 0.62} stroke="white" strokeWidth="0.6" />
              <line x1={W / 2 - 4} y1={H * 0.72} x2={W / 2 + 4} y2={H * 0.72} stroke="white" strokeWidth="0.6" />
              <line x1={W / 2 - 4} y1={H * 0.82} x2={W / 2 + 4} y2={H * 0.82} stroke="white" strokeWidth="0.6" />
              <ellipse cx={W / 2} cy={H * 0.45} rx="6" ry="4" fill="#F59E0B" />
            </g>
          )}

          {isAbsent && (
            <g stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round">
              <line x1={W * 0.25} y1={H * 0.25} x2={W * 0.75} y2={H * 0.75} />
              <line x1={W * 0.75} y1={H * 0.25} x2={W * 0.25} y2={H * 0.75} />
            </g>
          )}

          {isToExtract && !isAbsent && (
            <g stroke="#DC2626" strokeWidth="2" strokeLinecap="round">
              <line x1={W * 0.2} y1={H * 0.2} x2={W * 0.8} y2={H * 0.8} />
              <line x1={W * 0.8} y1={H * 0.2} x2={W * 0.2} y2={H * 0.8} />
            </g>
          )}
        </svg>
      </div>
      {!isUpper && <div className="tooth-num">{fdi}</div>}
    </div>
  );
}
