import React from "react";
import Tippy from "@tippyjs/react";
import 'tippy.js/dist/tippy.css';
import 'tippy.js/animations/scale.css';

interface ItemProps {
    itemID: string,
    name: string,
    icon: string,
    description: string,
    rarity: string,
    cost: number
}

interface relicProps {
    relicList: ItemProps[]
}

const Relics: React.FC<relicProps> = ({ relicList }) => {
    return (
        <div style={{ listStyle: "none", display: 'flex', justifyContent: "center", alignItems: "center" }}>
            Item:&nbsp;
            {relicList.map((item, index) => (
                <Tippy key={"T-" + index} content={<span>
                    {item.name}
                    <br />
                    <span style={{fontStyle: "oblique"}}>{item.description}</span>
                    <br />
                    <span style={{fontStyle: "italic"}}>🪙: {item.cost}</span>
                </span>} theme="light" animation="scale" delay={[100, 200]}>
                    <div key={"R-" + index}>{item.icon}</div>
                </Tippy>
            ))}
        </div>
    );
}

export default Relics;