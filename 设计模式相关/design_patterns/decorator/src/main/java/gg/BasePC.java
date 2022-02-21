package gg;

public abstract class BasePC {
    String descript = "unknown";

    public String getDescript() {
        return this.descript;
    }

    public abstract double cost();
}
