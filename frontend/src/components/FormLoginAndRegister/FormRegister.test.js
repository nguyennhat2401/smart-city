
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import FormRegister from "./FormRegister";
beforeEach(() => {
    jest.clearAllMocks();

    global.fetch = jest.fn();

    jest.spyOn(console, "error").mockImplementation(() => {});
    jest.spyOn(console, "warn").mockImplementation(() => {});
});
// Mock antd notification
jest.mock("antd", () => ({
    notification: {
        useNotification: () => [
            {
                success: jest.fn(),
                error: jest.fn(),
            },
            null,
        ],
    },
}));

describe("FormRegister Component", () => {

    beforeEach(() => {
        jest.clearAllMocks();

        global.fetch = jest.fn();

        window.alert = jest.fn();

        delete window.location;
        window.location = { href: "" };
    });

    test("renders register form", () => {
        render(<FormRegister />);

        expect(
            screen.getByRole("heading", { name: "Đăng ký" })
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Tài khoản")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Mật khẩu")
        ).toBeInTheDocument();

        expect(
            screen.getByPlaceholderText("Nhập lại mật khẩu")
        ).toBeInTheDocument();
    });

    test("updates input values", () => {
        render(<FormRegister />);

        const usernameInput =
            screen.getByPlaceholderText("Tài khoản");

        const passwordInput =
            screen.getByPlaceholderText("Mật khẩu");

        const confirmInput =
            screen.getByPlaceholderText("Nhập lại mật khẩu");

        fireEvent.change(usernameInput, {
            target: { value: "admin" },
        });

        fireEvent.change(passwordInput, {
            target: { value: "123456" },
        });

        fireEvent.change(confirmInput, {
            target: { value: "123456" },
        });

        expect(usernameInput.value).toBe("admin");
        expect(passwordInput.value).toBe("123456");
        expect(confirmInput.value).toBe("123456");
    });

    test("show alert when fields are empty", () => {
        render(<FormRegister />);

        fireEvent.click(screen.getByRole("button"));

        expect(window.alert).toHaveBeenCalledWith(
            "Không được để trống!"
        );
    });

    test("show alert when password not match", () => {
        render(<FormRegister />);

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Nhập lại mật khẩu"),
            {
                target: { value: "654321" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        expect(window.alert).toHaveBeenCalledWith(
            "Mật khẩu không khớp!"
        );
    });

    test("register successfully", async () => {

        global.fetch.mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                message: "Register success",
            }),
        });

        render(<FormRegister />);

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Nhập lại mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });

        expect(global.fetch).toHaveBeenCalledWith(
            "http://127.0.0.1:8000/api/auth/register/",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    username: "admin",
                    password: "123456",
                    role: "customer",
                }),
            }
        );

        expect(window.location.href).toBe("/login");
    });

    test("register failed", async () => {

        global.fetch.mockResolvedValueOnce({
            ok: false,
            json: async () => ({
                username: ["Username already exists"],
            }),
        });

        render(<FormRegister />);

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Nhập lại mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test("server connection error", async () => {

        global.fetch.mockRejectedValueOnce(
            new Error("Server error")
        );

        render(<FormRegister />);

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Nhập lại mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.click(screen.getByRole("button"));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalled();
        });
    });

    test("button disabled while loading", async () => {

        global.fetch.mockImplementationOnce(
            () =>
                new Promise((resolve) =>
                    setTimeout(
                        () =>
                            resolve({
                                ok: true,
                                json: async () => ({
                                    message: "success",
                                }),
                            }),
                        100
                    )
                )
        );

        render(<FormRegister />);

        fireEvent.change(
            screen.getByPlaceholderText("Tài khoản"),
            {
                target: { value: "admin" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        fireEvent.change(
            screen.getByPlaceholderText("Nhập lại mật khẩu"),
            {
                target: { value: "123456" },
            }
        );

        const button = screen.getByRole("button");

        fireEvent.click(button);

        expect(button).toBeDisabled();

        await waitFor(() => {
            expect(button).not.toBeDisabled();
        });
    });

});