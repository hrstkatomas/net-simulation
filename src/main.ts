import {
	Bodies,
	Body,
	Composite,
	Composites,
	Constraint,
	Engine,
	IConstraintDefinition,
	Mouse,
	MouseConstraint,
	Render,
	Runner,
} from "matter-js";
import { TearableConstraint } from "./TearableConstraint";

// create an engine
const engine = Engine.create();

// create a renderer
const render = Render.create({
	element: document.body,
	engine: engine,
});

// create the cloth
const methOriginFromTop = 100;
const methOriginFromLeft = 200;
const columns = 20;
const rows = 12;

// // create the points
const group = Body.nextGroup(true);
const cloth = Composites.stack(methOriginFromLeft, methOriginFromTop, columns, rows, 5, 5, function (x, y) {
	return Bodies.circle(x, y, 8, {
		inertia: Infinity,
		friction: 0.00001,
		isStatic: y === methOriginFromTop, // static first row
		collisionFilter: { group },
		render: { visible: true },
	});
});

// // add constraints between the points
const particleConstraintOptions: IConstraintDefinition = {
	stiffness: 0.06, // cloth stiffness
	damping: 0.6,
	render: { type: "line", lineWidth: 1, anchors: false },
};

const clothBodies = cloth.bodies;

for (let row = 0; row < rows; row++) {
	for (let col = 1; col < columns; col++) {
		const constraint = Constraint.create({
			bodyA: clothBodies[col - 1 + row * columns],
			bodyB: clothBodies[col + row * columns],
			...particleConstraintOptions,
		});

		TearableConstraint.add(engine, cloth, new TearableConstraint(constraint));
	}

	if (row > 0) {
		for (let col = 0; col < columns; col++) {
			const constraint = Constraint.create({
				bodyA: clothBodies[col + (row - 1) * columns],
				bodyB: clothBodies[col + row * columns],
				...particleConstraintOptions,
			});
			TearableConstraint.add(engine, cloth, new TearableConstraint(constraint));
		}
	}
}

Composite.add(engine.world, cloth);

// add Ground
const ground = Bodies.rectangle(400, 610, 810, 60, { isStatic: true });
Composite.add(engine.world, ground);

// mouse
const mouse = Mouse.create(render.canvas);
const mouseConstraints = MouseConstraint.create(engine, {
	mouse,
	constraint: {
		stiffness: 0.2,
		render: {
			visible: true,
		},
	},
});

Composite.add(engine.world, mouseConstraints);

// run the renderer
Render.run(render);

// create runner
const runner = Runner.create();

// run the engine
Runner.run(runner, engine);
