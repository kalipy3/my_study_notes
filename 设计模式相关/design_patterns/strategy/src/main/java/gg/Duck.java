package gg;

public abstract class Duck {
    public FlyBehavior flyBehavior;

    public void fly() {
        flyBehavior.fly();
    }

    public void setFlyBehavior(FlyBehavior flyBehavior) {
        this.flyBehavior = flyBehavior;
    }

    public void swim() {
        System.out.println("swim..");
    }

    public abstract void display();
}
