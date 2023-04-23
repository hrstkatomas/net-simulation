import { Composite, Constraint, Engine, Events, Vector } from "matter-js";

export class TearableConstraint {
	private readonly initialConstraintDistance;

	static add(engine: Engine, composite: Composite, constraint: TearableConstraint) {
		Composite.add(composite, constraint.constraint);

		Events.on(engine, "afterUpdate", () => {
			if (constraint.shouldTear()) Composite.remove(composite, constraint.constraint);
		});
	}

	constructor(public readonly constraint: Constraint, private readonly maxStretchFactor: number = 3) {
		this.initialConstraintDistance = this.distanceOfConstraint(constraint);
	}

	private calculateDistance({ x: xA, y: yA }: Vector, { x: xB, y: yB }: Vector) {
		return Math.sqrt((xB - xA) ** 2 + (yB - yA) ** 2);
	}

	private distanceOfConstraint(constraint: Constraint) {
		return this.calculateDistance(constraint.bodyA.position, constraint.bodyB.position);
	}

	shouldTear() {
		const currentConstraintDistance = this.distanceOfConstraint(this.constraint);
		const currentStretch = currentConstraintDistance / this.initialConstraintDistance;
		return currentStretch > this.maxStretchFactor;
	}
}
