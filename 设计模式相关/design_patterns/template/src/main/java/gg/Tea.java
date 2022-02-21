package gg;

public class Tea extends TeaWithHook {
    @Override
    void brew() {
        System.out.println("brew xx");
    }

    @Override
    void addCondiments() {
        System.out.println("add xx");
    }

    boolean customerWantsCondiments() {
        return true;
    }
}
