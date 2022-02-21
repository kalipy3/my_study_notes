package gg;

public abstract class TeaWithHook {
    final void prepare() {
        boilWater();
        brew();
        pourInCup();
        if (customerWantsCondiments()) {
            addCondiments();
        }
    }

    abstract void brew();
    abstract void addCondiments();

    void boilWater() {
        System.out.println("Boiling water");
    }

    void pourInCup() {
        System.out.println("pour in cup");
    }

    boolean customerWantsCondiments() {
        return false;
    }
}
